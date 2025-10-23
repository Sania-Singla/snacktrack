import { useState } from 'react';
import { checkTokenExpired, verifyExpression } from '../../Utils';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../Services';
import { Button, InputField } from '..';
import toast from 'react-hot-toast';
import { icons } from '../../Assets/icons';
import { useUserContext } from '../../Contexts';

export default function UpdatePassword() {
    const initialInputs = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    };
    const [inputs, setInputs] = useState(initialInputs);
    const [error, setError] = useState({});
    const [loading, setLoading] = useState(false);
    const [resetting, setResetting] = useState(false);
    const [disabled, setDisabled] = useState(true);
    const navigate = useNavigate();
    const { setUser } = useUserContext();
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    async function handleChange(e) {
        const { name, value } = e.target;
        setInputs((prev) => ({ ...prev, [name]: value }));
    }

    async function handleBlur(e) {
        const { name, value } = e.target;
        if (value && name === 'newPassword') {
            verifyExpression(name, value, setError);
        }
    }

    function handleDisable() {
        return Object.values(inputs).some((value) => !value);
    }

    function onMouseOver() {
        setDisabled(handleDisable());
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (handleDisable()) {
            toast.error('Please fill all fields correctly');
            return;
        }
        setLoading(true);
        setDisabled(true);
        setError({});
        try {
            if (inputs.newPassword !== inputs.confirmPassword) {
                setError((prevError) => ({
                    ...prevError,
                    confirmPassword:
                        'confirm password should match new password',
                }));
            } else if (inputs.oldPassword === inputs.newPassword) {
                setError((prevError) => ({
                    ...prevError,
                    newPassword: 'new password should not match old password',
                }));
            } else {
                const res = await userService.updatePassword({
                    oldPassword: inputs.oldPassword,
                    newPassword: inputs.newPassword,
                });

                if (res && res.message === 'password updated successfully') {
                    setInputs(initialInputs);
                    toast.success('Password updated successfully');
                } else if (res && res.message !== 'tokens missing') {
                    setError((prev) => ({ ...prev, oldPassword: res.message }));
                } else checkTokenExpired(res, setUser);
            }
        } catch (err) {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setDisabled(false);
            setLoading(false);
            setShowPassword(false);
            setShowNewPassword(false);
            setShowConfirmPassword(false);
        }
    }

    async function resetPassword() {
        setResetting(true);
        try {
            const res = await userService.resetPassword();
            if (res && res.message === 'new password sent to email') {
                toast.success('New password sent to your email');
            } else checkTokenExpired(res, setUser);
        } catch (err) {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setResetting(false);
        }
    }

    const inputFields = [
        {
            name: 'oldPassword',
            type: showPassword ? 'text' : 'password',
            placeholder: 'Enter current Password',
            label: 'Old Password',
            required: true,
        },
        {
            name: 'newPassword',
            type: showNewPassword ? 'text' : 'password',
            placeholder: 'Create new password',
            label: 'New Password',
            required: true,
        },
        {
            name: 'confirmPassword',
            type: showConfirmPassword ? 'text' : 'password',
            placeholder: 'Confirm new password',
            label: 'Confirm Password',
            required: true,
        },
    ];

    const inputElements = inputFields.map((field) =>
        field.name === 'oldPassword' ? (
            <div className="w-full" key={field.name}>
                <InputField
                    field={field}
                    handleChange={handleChange}
                    inputs={inputs}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                />
                {error[field.name] && (
                    <p className="text-red-500 text-xs">{error[field.name]}</p>
                )}
            </div>
        ) : (
            <div className="w-full" key={field.name}>
                <InputField
                    field={field}
                    handleBlur={handleBlur}
                    handleChange={handleChange}
                    inputs={inputs}
                    showPassword={
                        field.name === 'newPassword'
                            ? showNewPassword
                            : showConfirmPassword
                    }
                    setShowPassword={
                        field.name === 'newPassword'
                            ? setShowNewPassword
                            : setShowConfirmPassword
                    }
                />
                {!error.newPassword && field.name === 'newPassword' && (
                    <p className="text-xs text-gray-700">
                        Password must be 8-12 characters.
                    </p>
                )}
                {error[field.name] && (
                    <p className="text-red-500 font-medium text-xs">
                        {error[field.name]}
                    </p>
                )}
            </div>
        )
    );

    return (
        <div className="w-full p-2">
            <div className="rounded-md border-1 border-gray-200 shadow-xs flex flex-col sm:flex-row bg-white py-7 px-6 sm:gap-14">
                <div className="w-full">
                    <h3 className="text-xl font-semibold">Update Password</h3>
                    <p className="mt-4 text-gray-600">
                        Update your password here. Please note that changes
                        cannot be undone.
                    </p>
                    {/* <div className="my-4">
                        <Button
                            btnText={
                                resetting ? (
                                    <div className="flex items-center justify-center w-full">
                                        <div className="size-5 fill-[#4977ec] dark:text-[#a2bdff]">
                                            {icons.loading}
                                        </div>
                                    </div>
                                ) : (
                                    'Reset'
                                )
                            }
                            onClick={resetPassword}
                            disabled={resetting || loading}
                            className="text-white rounded-md h-9 w-fit px-4 bg-[#4977ec] hover:bg-[#3b62c2]"
                        />
                    </div> */}
                </div>
                <form onSubmit={handleSubmit} className="w-full max-w-[600px]">
                    <div className="flex flex-col gap-2">{inputElements}</div>
                    <div className="flex gap-4 mt-6">
                        <Button
                            btnText="Cancel"
                            onMouseOver={onMouseOver}
                            disabled={loading}
                            onClick={() => {
                                setInputs(initialInputs);
                                setError({});
                            }}
                            className="text-white rounded-md h-9 w-full bg-[#4977ec] hover:bg-[#3b62c2]"
                        />
                        <Button
                            btnText={
                                loading ? (
                                    <div className="flex items-center justify-center w-full">
                                        <div className="size-5 fill-[#4977ec] dark:text-[#a2bdff]">
                                            {icons.loading}
                                        </div>
                                    </div>
                                ) : (
                                    'Update'
                                )
                            }
                            type="submit"
                            disabled={disabled}
                            onMouseOver={onMouseOver}
                            className="text-white rounded-md h-9 w-full bg-[#4977ec] hover:bg-[#3b62c2]"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}

import { useState } from 'react';
import { verifyExpression } from '../../Utils';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../Services';
import { Button, InputField } from '..';
import toast from 'react-hot-toast';
import { useUserContext } from '../../Contexts';
import { icons } from '../../Assets/icons';

export default function UpdatePassword() {
    const initialInputs = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    };
    const [inputs, setInputs] = useState(initialInputs);
    const [error, setError] = useState({});
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { user } = useUserContext();

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

    async function onMouseOver() {
        if (Object.values(inputs).some((value) => !value)) {
            setDisabled(true);
        } else {
            setDisabled(false);
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
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
                } else {
                    setError((prev) => ({ ...prev, oldPassword: res.message }));
                }
            }
        } catch (err) {
            navigate('/server-error');
        } finally {
            setDisabled(false);
            setLoading(false);
            setShowPassword(false);
            setShowNewPassword(false);
            setShowConfirmPassword(false);
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
                    <p className="text-xs">Password must be 8-12 characters.</p>
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
            <div className="rounded-xl drop-shadow-md flex flex-col sm:flex-row bg-white px-8 py-6 sm:gap-14">
                <div className="w-full py-4">
                    <h3 className="text-2xl font-bold">Change Password</h3>
                    <p className="mt-2">
                        Update your password to secure your account. Changes are
                        final once saved and cannot be undone.
                    </p>
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
                            className="text-white rounded-md h-[40px] text-lg w-full bg-[#4977ec] hover:bg-[#3b62c2]"
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
                            className="text-white rounded-md h-[40px] text-lg w-full bg-[#4977ec] hover:bg-[#3b62c2]"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}

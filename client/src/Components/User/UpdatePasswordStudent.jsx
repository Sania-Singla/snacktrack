import { useState } from 'react';
import { getRollNo, readQR, verifyExpression } from '../../Utils';
import { icons } from '../../Assets/icons';
import InputField from '../General/InputField';
import Button from '../General/Button';
import { studentService } from '../../Services';
import toast from 'react-hot-toast';
import { useUserContext } from '../../Contexts/User.Context';

export default function UpdatePasswordStudent() {
    const [disabled, setDisabled] = useState(false);
    const [token, setToken] = useState('');
    const [loading, setLoading] = useState(false);
    const initialInputs = {
        newPassword: '',
        confirmPassword: '',
    };
    const [inputs, setInputs] = useState(initialInputs);
    const [error, setError] = useState({});
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

    function handleDisable() {
        return Object.values(inputs).some((value) => !value);
    }

    function onMouseOver() {
        setDisabled(handleDisable());
    }

    async function handleUpload(e) {
        setDisabled(true);
        try {
            const files = e.target.files;

            if (!files || files.length === 0) return;

            const decode = await readQR(files[0]);
            setToken(decode.token);
            toast.success('QR uploaded successfully');
        } catch (error) {
            toast.error('Something went wrong. Please try again.');
        }
    }
    async function handleSubmit(e) {
        setLoading(true);
        setDisabled(true);
        try {
            const res = await studentService.updatePassword({
                token,
                newPassword: inputs.newPassword,
            });

            console.log(res);

            if (res && !res.message) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                const name = `${getRollNo(user?.userName)}-updatedQR.png`;
                a.download = name;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
                toast.success('Password Updated Successfully.');
            } else toast.error('Error Updating Password');
        } catch (error) {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
            setDisabled(false);
            setShowNewPassword(false);
            setShowConfirmPassword(false);
        }
    }
    const inputFields = [
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

    const inputElements = inputFields.map((field) => (
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
                <p className="text-red-500 text-xs">{error[field.name]}</p>
            )}
        </div>
    ));

    return (
        <div className="rounded-md border-1 border-gray-200 shadow-xs flex flex-col sm:flex-row bg-white py-7 px-6 sm:gap-14">
            <div className="w-full">
                <h3 className="text-xl font-semibold">Password</h3>
                <p className="mt-4 text-gray-600">
                    Renew your QR by changing your password.
                </p>
            </div>
            <div className="w-full">
                <input
                    type="file"
                    multiple={false}
                    className="hidden"
                    accept="image/*"
                    name="qr"
                    id="qr"
                    onChange={handleUpload}
                    onClick={(e) => (e.target.value = null)}
                />

                <label
                    htmlFor="qr"
                    className="border mt-3 h-10 flex gap-2.5 items-center justify-center transition-all duration-200 hover:bg-[#4977ec]/10 active:scale-[98%] cursor-pointer text-center border-[#4977ec] rounded-md w-full"
                >
                    <span className="text-[#4977ec] text-[15px] font-medium">
                        Upload Old QR
                    </span>
                    <div className="size-5.5 fill-[#4977ec]">
                        {icons.upload}
                    </div>
                </label>

                {inputElements}

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
                    onClick={handleSubmit}
                    disabled={disabled}
                    onMouseOver={onMouseOver}
                    className="text-white rounded-md h-9 w-full bg-[#4977ec] hover:bg-[#3b62c2] mt-3"
                />
            </div>
        </div>
    );
}


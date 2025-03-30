import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../../Contexts';
import { getRollNo, verifyExpression } from '../../Utils';
import { contractorService } from '../../Services';
import { Button, InputField } from '..';
import toast from 'react-hot-toast';
import { icons } from '../../Assets/icons';

export default function UpdateAccountDetails() {
    const { user, setUser } = useUserContext();
    const initialInputs = {
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        password: '',
    };
    const [inputs, setInputs] = useState(initialInputs);
    const [error, setError] = useState({});
    const [disabled, setDisabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    function handleChange(e) {
        const { name, value } = e.target;
        setInputs((prev) => ({ ...prev, [name]: value }));
    }

    function handleBlur(e) {
        const { name, value } = e.target;
        if (value && name !== 'password') {
            verifyExpression(name, value, setError);
        }
    }

    function onMouseOver() {
        if (
            Object.values(inputs).some((value) => !value) ||
            Object.entries(error).some(
                ([key, value]) => value && key !== 'password'
            ) ||
            !Object.entries(inputs).some(
                ([key, value]) =>
                    value !== initialInputs[key] && key !== 'password'
            )
        ) {
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
            let res = null;
            if (user.role === 'contractor') {
                res = await contractorService.updateAccountDetails(inputs);
            }
            if (res && res.message === 'account details updated successfully') {
                setUser((prev) => ({
                    ...prev,
                    fullName: inputs.fullName,
                    phoneNumber: inputs.phoneNumber,
                    email: inputs.email,
                }));
                setInputs((prev) => ({ ...prev, password: '' }));
                toast.success('Account details updated successfully');
            } else {
                setError((prev) => ({ ...prev, password: res.message }));
            }
        } catch (err) {
            navigate('/server-error');
        } finally {
            setDisabled(false);
            setLoading(false);
            setShowPassword(false);
        }
    }

    const inputFields = [
        {
            name: 'email',
            type: 'text',
            placeholder: 'Enter your email',
            label: 'Email',
            required: true,
        },
        {
            name: 'fullName',
            type: 'text',
            placeholder: 'Enter your full name',
            label: 'First name',
            required: true,
        },
        {
            name: 'phoneNumber',
            type: 'text',
            placeholder: 'Enter your phone number',
            label: 'Phone Number',
            required: true,
        },
        {
            name: 'password',
            type: showPassword ? 'text' : 'password',
            placeholder: 'Enter your password',
            label: 'Password',
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
                showPassword={showPassword}
                setShowPassword={setShowPassword}
            />
            {error[field.name] && (
                <div className="text-red-500 text-xs font-medium">
                    {error[field.name]}
                </div>
            )}
        </div>
    ));

    return (
        <div className="w-full p-2">
            {user.role !== 'student' ? (
                <div className="rounded-xl drop-shadow-md flex flex-col sm:flex-row bg-white py-6 px-8 sm:gap-14">
                    <div className="w-full py-4">
                        <h3 className="text-2xl font-bold">
                            Update Personal Information
                        </h3>
                        <p className="mt-2">
                            Update your personal details here. Please note that
                            changes cannot be undone.
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="w-full max-w-[600px] relative -top-2"
                    >
                        <div className="flex flex-col gap-2">
                            {inputElements}
                        </div>
                        <div className="flex gap-4 mt-6">
                            <Button
                                onMouseOver={onMouseOver}
                                btnText="Cancel"
                                onClick={() => {
                                    setInputs(initialInputs);
                                    setError({});
                                }}
                                disabled={loading}
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
                                disabled={disabled}
                                type="submit"
                                onMouseOver={onMouseOver}
                                className="text-white rounded-md h-[40px] text-lg w-full bg-[#4977ec] hover:bg-[#3b62c2]"
                            />
                        </div>
                    </form>
                </div>
            ) : (
                <div className="rounded-xl drop-shadow-md flex flex-col sm:flex-row bg-white py-6 px-8 sm:gap-14">
                    <div className="w-full py-4">
                        <h3 className="text-2xl font-bold">
                            Personal Information
                        </h3>
                        <p className="mt-2">
                            Your personal details are desplayed here. Please
                            note that to make any changes here you have to go to
                            the POC from where you were registered.
                        </p>
                    </div>

                    <div className="w-full max-w-[600px]">
                        <div className="shadow-md p-3 rounded-md w-full border-[0.01rem] border-gray-500 flex flex-col gap-4">
                            <div>
                                <span className="font-semibold text-lg">
                                    Hostel:{' '}
                                </span>
                                {user.hostelName} @
                                {user.hostelType + user.hostelNumber}
                            </div>
                            <div>
                                <span className="font-semibold text-lg">
                                    Full Name:{' '}
                                </span>
                                {user.fullName}
                            </div>
                            <div>
                                <span className="font-semibold text-lg">
                                    Roll No:{' '}
                                </span>
                                {getRollNo(user.userName)}
                            </div>
                            <div>
                                <span className="font-semibold text-lg">
                                    Email:{' '}
                                </span>
                                {user.email}
                            </div>
                            <div>
                                <span className="font-semibold text-lg">
                                    Phone Number:{' '}
                                </span>
                                {user.phoneNumber}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

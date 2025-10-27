import { useState } from 'react';
import { useUserContext } from '../../Contexts';
import { verifyExpression } from '../../Utils';
import { adminService } from '../../Services';
import { Button, InputField } from '..';
import toast from 'react-hot-toast';
import { icons } from '../../Assets/icons';

export default function UpdateAccountDetails() {
    const { user, setUser } = useUserContext();
    const initialInputs = {
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
    };
    const [inputs, setInputs] = useState(initialInputs);
    const [error, setError] = useState({});
    const [disabled, setDisabled] = useState(true);
    const [loading, setLoading] = useState(false);

    function handleChange(e) {
        const { name, value } = e.target;
        setInputs((prev) => ({ ...prev, [name]: value }));
    }

    function handleBlur(e) {
        const { name, value } = e.target;
        if (value) {
            verifyExpression(name, value, setError);
        }
    }

    function handleDisable() {
        return (
            Object.values(inputs).some((value) => !value) ||
            Object.entries(error).some(([key, value]) => value) ||
            !Object.entries(inputs).some(
                ([key, value]) => value !== initialInputs[key]
            )
        );
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
            const res = await adminService.updateAccountDetails(inputs);
            if (res && res.message === 'account details updated successfully') {
                setUser((prev) => ({
                    ...prev,
                    fullName: inputs.fullName,
                    phoneNumber: inputs.phoneNumber,
                    email: inputs.email,
                }));
                toast.success('Account details updated successfully');
            } else checkTokenExpired(res, setUser);
        } catch (err) {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setDisabled(false);
            setLoading(false);
        }
    }

    const inputFields = [
        {
            name: 'fullName',
            type: 'text',
            placeholder: 'Enter your full name',
            label: 'Full Name',
            required: true,
        },
        {
            name: 'email',
            type: 'text',
            placeholder: 'Enter your email',
            label: 'Email',
            required: true,
        },
        {
            name: 'phoneNumber',
            type: 'text',
            placeholder: 'Enter your phone number',
            label: 'Phone Number',
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
            <div className="rounded-md border-1 border-gray-200 shadow-xs flex flex-col sm:flex-row bg-white py-7 px-6 sm:gap-14">
                <div className="w-full">
                    <h3 className="text-xl font-semibold">
                        Update Personal Details
                    </h3>
                    <p className="mt-4 text-gray-600">
                        Update your personal details here. Please note that
                        changes cannot be undone.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="w-full max-w-[600px]">
                    <div className="flex flex-col gap-2">{inputElements}</div>
                    <div className="flex gap-4 mt-6">
                        <Button
                            onMouseOver={onMouseOver}
                            btnText="Cancel"
                            onClick={() => {
                                setInputs(initialInputs);
                                setError({});
                            }}
                            disabled={loading}
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
                            disabled={disabled}
                            type="submit"
                            onMouseOver={onMouseOver}
                            className="text-white rounded-md h-9 w-full bg-[#4977ec] hover:bg-[#3b62c2]"
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}

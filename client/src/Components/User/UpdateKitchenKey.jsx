import { useState } from 'react';
import { checkTokenExpired, verifyExpression } from '../../Utils';
import { useNavigate } from 'react-router-dom';
import { contractorService } from '../../Services';
import { Button, InputField } from '..';
import toast from 'react-hot-toast';
import { icons } from '../../Assets/icons';
import { useUserContext } from '../../Contexts';

export default function UpdatePassword() {
    const initialInputs = {
        newKey: '',
        confirmKey: '',
        password: '',
    };
    const [inputs, setInputs] = useState(initialInputs);
    const [error, setError] = useState({});
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(true);
    const navigate = useNavigate();
    const { setUser } = useUserContext();
    const [showPassword, setShowPassword] = useState(false);
    const [showNewKey, setShowNewKey] = useState(false);
    const [showConfirmKey, setShowConfirmKey] = useState(false);

    async function handleChange(e) {
        const { name, value } = e.target;
        setInputs((prev) => ({ ...prev, [name]: value }));
    }

    async function handleBlur(e) {
        const { name, value } = e.target;
        if (value && name === 'newKey') {
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
            if (inputs.newKey !== inputs.confirmKey) {
                setError((prevError) => ({
                    ...prevError,
                    confirmKey: 'confirm key should match new key',
                }));
            } else {
                const res = await contractorService.updateKitchenKey({
                    password: inputs.password,
                    newKey: inputs.newKey,
                });

                if (res && res.message === 'key updated successfully') {
                    setInputs(initialInputs);
                    toast.success('Key updated successfully');
                } else if (res && res.message !== 'tokens missing') {
                    setError((prevError) => ({
                        ...prevError,
                        password: 'Invalid credentials',
                    }));
                } else checkTokenExpired(res, setUser);
            }
        } catch (err) {
            navigate('/server-error');
        } finally {
            setDisabled(false);
            setLoading(false);
            setShowPassword(false);
            setShowNewKey(false);
            setShowConfirmKey(false);
        }
    }

    const inputFields = [
        {
            name: 'newKey',
            type: showNewKey ? 'text' : 'password',
            placeholder: 'Create new key',
            label: 'New Key',
            required: true,
        },
        {
            name: 'confirmKey',
            type: showConfirmKey ? 'text' : 'password',
            placeholder: 'Confirm new key',
            label: 'Confirm Key',
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

    const inputElements = inputFields.map((field) =>
        field.name === 'password' ? (
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
                        field.name === 'newKey' ? showNewKey : showConfirmKey
                    }
                    setShowPassword={
                        field.name === 'newKey'
                            ? setShowNewKey
                            : setShowConfirmKey
                    }
                />
                {!error.newKey && field.name === 'newKey' && (
                    <p className="text-xs">Key must be 8-12 characters.</p>
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
            <div className="rounded-lg drop-shadow-sm flex flex-col sm:flex-row bg-white py-7 px-6 sm:gap-14">
                <div className="w-full">
                    <h3 className="text-2xl font-semibold">
                        Update Kitchen Key
                    </h3>
                    <p className="mt-4 text-gray-600">
                        Update your kitchen key here. Please note that changes
                        cannot be undone.
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

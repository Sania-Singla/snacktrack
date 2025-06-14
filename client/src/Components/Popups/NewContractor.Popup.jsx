import { useState } from 'react';
import { adminService } from '../../Services';
import { useNavigate } from 'react-router-dom';
import { Button, InputField } from '..';
import { verifyExpression } from '../../Utils';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { usePopupContext } from '../../Contexts';
import { motion } from 'framer-motion';
import { icons } from '../../Assets/icons';
import toast from 'react-hot-toast';

export default function NewContractorPopup() {
    const [error, setError] = useState({});
    const { setPopupInfo, setShowPopup } = usePopupContext();
    const [disabled, setDisabled] = useState(true);
    const [loading, setLoading] = useState(false);
    const { popupInfo } = usePopupContext();
    const navigate = useNavigate();
    const [inputs, setInputs] = useState({
        fullName: (popupInfo.autoFill && popupInfo.contractor.fullName) || '',
        phoneNumber:
            (popupInfo.autoFill && popupInfo.contractor.phoneNumber) || '',
        email: (popupInfo.autoFill && popupInfo.contractor.email) || '',
    });
    const [isVerified, setIsVerified] = useState(popupInfo.isVerified || false);
    const [sendingMail, setSendingMail] = useState(false);
    const [isChecked, setIsChecked] = useState(false);

    function handleChange(e) {
        const { value, name } = e.target;
        setInputs((prev) => ({ ...prev, [name]: value }));
        if (value) verifyExpression(name, value, setError);
        else setError((prev) => ({ ...prev, [name]: '' }));
        if (name === 'email') {
            if (value === popupInfo.contractor?.email) {
                setIsVerified(true);
            } else setIsVerified(false);
        }
        onMouseOver();
    }

    async function sendVerifyEmail() {
        try {
            if (!inputs.email || !inputs.fullName) {
                toast.error('Please enter your email and name');
                return;
            }
            setSendingMail(true);
            const res = await adminService.sendVerificationCode({
                fullName: inputs.fullName,
                email: inputs.email,
            });
            if (res && res.message === 'Verification code sent') {
                toast.success('Verification code sent to your email');
                setShowPopup(true);
                setPopupInfo({
                    type: 'verifyEmail',
                    target: { email: inputs.email, fullName: inputs.fullName },
                    onVerify: () => {
                        setPopupInfo({
                            contractor: {
                                ...inputs,
                                _id: popupInfo.contractor?._id,
                            },
                            isVerified: true,
                            autoFill: true,
                            type: 'newContractor',
                        });
                    },
                });
            }
        } catch (err) {
            toast.error('Failed to send verification email');
        } finally {
            setSendingMail(false);
        }
    }

    function handlePhoneChange(value, country, e, formattedValue) {
        const name = e.target.name || 'phoneNumber'; // because when flag changes the name = undefiend
        setInputs((prev) => ({ ...prev, [name]: formattedValue }));
        if (value) verifyExpression(name, formattedValue, setError);
        else setError((prev) => ({ ...prev, [name]: '' }));
        onMouseOver();
    }

    function handleDisable() {
        return (
            Object.entries(inputs).some(
                ([key, value]) => !value && key !== 'kitchenKey'
            ) ||
            Object.entries(error).some(
                ([key, value]) => value && key !== 'root'
            ) ||
            !isVerified ||
            !isChecked
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
            const res = await adminService.changeContractor(
                popupInfo.contractor._id,
                inputs
            );
            if (res && !res.message) {
                toast.success('Contractor chnaged Successfully');
            } else setError((prev) => ({ ...prev, root: res.message }));
        } catch (err) {
            navigate('/server-error');
        } finally {
            setDisabled(false);
            setLoading(false);
        }
    }

    const inputFields = [
        {
            type: 'text',
            name: 'fullName',
            label: 'Full Name',
            placeholder: 'Enter your Full name',
            required: true,
        },
        {
            type: 'email',
            name: 'email',
            label: 'Email',
            placeholder: 'Enter your Email',
            required: true,
        },
    ];

    const inputElements = inputFields.map((field) => (
        <div className="w-full" key={field.name}>
            <div className="flex w-full justify-center items-center gap-4">
                <InputField
                    field={field}
                    handleChange={handleChange}
                    inputs={inputs}
                    className="w-full"
                />
                {field.name === 'email' && (
                    <Button
                        title={!isVerified && 'Verify email'}
                        btnText={
                            sendingMail ? (
                                <div className="flex items-center justify-center">
                                    <div className="size-4 fill-[#4977ec] dark:text-[#a2bdff]">
                                        {icons.loading}
                                    </div>
                                </div>
                            ) : isVerified ? (
                                'Verified'
                            ) : (
                                'Verify'
                            )
                        }
                        onClick={sendVerifyEmail}
                        className={`rounded-md mt-[22px] w-[100px] h-[40px] text-sm flex items-center justify-center ${
                            isVerified
                                ? 'bg-green-600 cursor-not-allowed text-white border'
                                : 'bg-[#4977ec] text-white hover:bg-[#3b62c2] active:scale-[98%]'
                        }`}
                        disabled={isVerified || sendingMail}
                    />
                )}
            </div>
            {error[field.name] && field.name !== 'email' && (
                <div className="text-red-500 text-xs font-medium">
                    {error[field.name]}
                </div>
            )}
        </div>
    ));

    return (
        <div className="relative w-[350px] sm:w-[450px] transition-all duration-300 bg-white rounded-xl overflow-hidden text-black p-6 flex flex-col items-center justify-center gap-3">
            <Button
                btnText={
                    <div className="size-[20px] stroke-black">
                        {icons.cross}
                    </div>
                }
                title="Close"
                onClick={() => setShowPopup(false)}
                className="absolute top-3 right-3"
            />
            <p className="text-center text-2xl font-bold">
                Change Contractor
            </p>
            <div className="w-full flex flex-col items-center justify-center gap-3">
                {error.root && (
                    <div className="text-red-500 w-full text-center">
                        {error.root}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col items-start justify-center gap-4 w-full"
                >
                    <div className="w-full flex flex-col gap-1">
                        {inputElements}

                        {/* phone number field */}
                        <div className="w-full shadow-md shadow-[#f8f0eb]">
                            <div className="bg-white z-[10] text-[15px] ml-2 px-1 w-fit relative top-3 font-medium">
                                <label htmlFor="phoneNumber">
                                    <span className="text-red-500">* </span>
                                    Phone Number
                                </label>
                            </div>
                            <div className="w-full">
                                <PhoneInput
                                    countryCodeEditable={false}
                                    country={'in'}
                                    value={inputs.phoneNumber}
                                    onChange={handlePhoneChange}
                                    inputProps={{
                                        name: 'phoneNumber',
                                        required: true,
                                        id: 'phoneNumber',
                                    }}
                                    inputClass="!w-full !h-[42px] !indent-2 !rounded-md !shadow-sm !border-[0.01rem] !border-[#858585] !outline-[#f68533] !bg-transparent"
                                    buttonClass="!h-[42px] !w-[45px] !bg-white !hover:bg-white !z-[1] !rounded-r-none !rounded-md !border-[0.01rem] !border-[#858585] !outline-[#f68533]"
                                />
                            </div>
                            {error.phoneNumber && (
                                <div className="text-red-500 text-xs font-medium">
                                    {error.phoneNumber}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="w-full">
                        <input
                            type="checkbox"
                            name="confirmation"
                            id="confirmation"
                            className="mt-1"
                            onChange={(e) => setIsChecked(e.target.checked)}
                        />
                        <label
                            className="ml-2 text-md text-red-600 font-semibold"
                            htmlFor="confirmation"
                        >
                            This will permanently clear out the information
                            about the old contractor.
                        </label>
                        <Button
                            type="submit"
                            className={`text-white rounded-md py-2 mt-2 h-[40px] flex items-center justify-center text-lg w-full bg-[#4977ec] hover:bg-[#3b62c2] transition-all duration-200 ${
                                disabled
                                    ? 'bg-gray-400 cursor-not-allowed opacity-90 grayscale-[30%] saturate-50'
                                    : 'bg-[#4977ec] hover:bg-[#3b62c2] hover:shadow-md active:scale-[98%]'
                            }`}
                            disabled={disabled}
                            onMouseOver={onMouseOver}
                            btnText={
                                loading ? (
                                    <div className="size-5 fill-[#4977ec] dark:text-[#a2bdff]">
                                        {icons.loading}
                                    </div>
                                ) : (
                                    'Add new Contractor'
                                )
                            }
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}

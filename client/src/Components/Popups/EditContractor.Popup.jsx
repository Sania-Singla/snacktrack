import { useEffect, useState } from 'react';
import { adminService } from '../../Services';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../General/Button';
import InputField from '../General/InputField';
import { verifyExpression } from '../../Utils';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { usePopupContext } from '../../Contexts';
import { motion } from 'framer-motion';
import { icons } from '../../Assets/icons';
import toast from 'react-hot-toast';

export default function EditContractorPopup() {
    const [error, setError] = useState({});
    const { setPopupInfo, setShowPopup, popupInfo } = usePopupContext();
    const [disabled, setDisabled] = useState(true);
    const [showkitchenKey, setShowKitchenKey] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [inputs, setInputs] = useState({
        fullName: popupInfo.contractor?.fullName,
        phoneNumber: popupInfo.contractor?.phoneNumber,
        email: popupInfo.contractor?.email,
        kitchenKey: popupInfo.contractor?.kitchenKey || '',
    });
    const [isVerified, setIsVerified] = useState(true);
    const [sendingMail, setSendingMail] = useState(false);

    function handleChange(e) {
        const { value, name } = e.target;
        setInputs((prev) => ({ ...prev, [name]: value }));
        if (value) {
            verifyExpression(name, value, setError);
        } else setError((prev) => ({ ...prev, [name]: '' }));
        if (name === 'email') {
            if (value === popupInfo.contractor?.email) {
                setIsVerified(true);
            } else setIsVerified(false);
        }
        onMouseOver();
    }

    useEffect(() => {
        onMouseOver();
    }, []);

    async function sendVerifyEmail() {
        try {
            if (!inputs.email || !inputs.fullName) {
                toast.error('Please enter your email and fullName');
                return;
            }

            setSendingMail(true);

            const res = await adminService.sendVerificationCode({
                fullName: inputs.fullName,
                email: inputs.email,
            });
            if (res && res.message === 'Verification code sent') {
                toast.success('Verification code sent to your email');

                setPopupInfo({
                    type: 'verifyEmail',
                    target: { email: inputs.email, fullName: inputs.fullName },
                    onVerify: () => {
                        setIsVerified(true);
                        setPopupInfo({
                            contractor: {
                                _id: popupInfo.contractor._id,
                                ...inputs,
                            },
                            type: 'editContractor',
                        });
                    },
                });
            }
            setSendingMail(false);
        } catch (err) {
            toast.error('Failed to send verification email');
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
            !isVerified
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
            const res = await adminService.updateContractor(
                popupInfo.contractor?._id,
                inputs
            );
            if (res && !res.message) {
                toast.success('Contractor Updated Successfully');
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
            placeholder: 'Enter your Full Name',
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
                    showPassword={showkitchenKey}
                    setShowPassword={setShowKitchenKey}
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
            <div>
                <p className="text-center px-2 text-[28px] font-medium">
                    Edit Contractor
                </p>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.3 }}
                    className="relative -top-1 h-[0.1rem] bg-[#333333]"
                />
            </div>
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
                        
                        <div className="w-full shadow-md shadow-[#f8f0eb]">
                            <div className="bg-white z-[10] text-[15px] ml-2 px-1 w-fit relative top-3 font-medium">
                                <label htmlFor="kitchenKey">Kitchen Key</label>
                            </div>
                            <div className="relative flex items-center w-full justify-center mb-3">
                                <input
                                    name="kitchenKey"
                                    id="kitchenKey"
                                    type={showkitchenKey ? 'text' : 'password'}
                                    autoFocus
                                    onChange={(e) =>
                                        setInputs((prev) => ({
                                            ...prev,
                                            kitchenKey: e.target.value,
                                        }))
                                    }
                                    className="overflow-x-scroll disabled:opacity-50 disabled:cursor-not-allowed shadow-sm py-2 rounded-md px-3 w-full border-[0.01rem] border-gray-500 bg-transparent placeholder:text-[15px]"
                                />
                                <div
                                    onClick={() =>
                                        setShowKitchenKey((prev) => !prev)
                                    }
                                    className="size-[20px] absolute right-3 top-[50%] transform translate-y-[-50%] cursor-pointer fill-gray-700"
                                >
                                    {showkitchenKey ? icons.eyeOff : icons.eye}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="w-full">
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
                                    'Update Contractor'
                                )
                            }
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}

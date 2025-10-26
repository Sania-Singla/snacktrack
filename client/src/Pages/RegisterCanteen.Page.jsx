import { useEffect, useState } from 'react';
import { adminService } from '../Services';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Dropdown, InputField } from '../Components';
import { verifyExpression } from '../Utils';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { usePopupContext } from '../Contexts';
import { LOGO } from '../Constants';
import { motion } from 'framer-motion';
import { icons } from '../Assets/icons';
import toast from 'react-hot-toast';

export default function RegisterCanteenPage() {
    const initialInputs = {
        fullName: '',
        phoneNumber: '',
        email: '',
    };
    const [inputs, setInputs] = useState(initialInputs);
    const [error, setError] = useState({});
    const { setPopupInfo, setShowPopup } = usePopupContext();
    const [disabled, setDisabled] = useState(true);
    const [loading, setLoading] = useState(false);
    const [sendingMail, setSendingMail] = useState(false);
    const navigate = useNavigate();
    const [hostel, setHostel] = useState({});
    const [isVerified, setIsVerified] = useState(false);
    const [hostels, setHostels] = useState([
        { label: 'Select Hostel', value: '' },
    ]);

    function handleChange(e) {
        const { value, name } = e.target;
        setInputs((prev) => ({ ...prev, [name]: value }));
        if (value) verifyExpression(name, value, setError);
        else setError((prev) => ({ ...prev, [name]: '' }));
        onMouseOver();
    }

    function handlePhoneChange(value, country, e, formattedValue) {
        const name = e.target.name || 'phoneNumber'; // because when flag changes the name = undefiend
        setInputs((prev) => ({ ...prev, [name]: formattedValue }));
        if (value) verifyExpression(name, formattedValue, setError);
        else setError((prev) => ({ ...prev, [name]: '' }));
        onMouseOver();
    }

    async function sendVerifyEmail() {
        try {
            if (!inputs.email) {
                toast.error('Please enter your email');
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
                        setIsVerified(true);
                        setShowPopup(false);
                    },
                });
            }

            setSendingMail(false);
        } catch (err) {
            toast.error('Failed to send verification email');
        } finally {
            setSendingMail(false);
        }
    }

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        (async function () {
            try {
                const res = await adminService.getHostels(signal);
                if (res)
                    setHostels((prev) => [
                        ...prev,
                        ...res.map((h) => ({
                            label: `${h.hostelType}${h.hostelNumber}-${h.hostelName}`,
                            value: h,
                        })),
                    ]);
            } catch (err) {
                toast.error('Something went wrong. Please try again.');
            }
        })();

        return () => controller.abort();
    }, []);

    function handleDisable() {
        return (
            Object.values(inputs).some((value) => !value) ||
            Object.entries(error).some(
                ([key, value]) => value && key !== 'root'
            ) ||
            !hostel ||
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
            const res = await adminService.registerCanteen({
                hostel,
                ...inputs,
            });
            if (res && !res.message) {
                toast.success('Canteen Registered Successfully');
                navigate('/admin');
            } else {
                setError((prev) => ({ ...prev, root: res.message }));
            }
        } catch (err) {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsVerified(false);
            setInputs(initialInputs);
            setDisabled(false);
            setLoading(false);
        }
    }

    const inputFields = [
        {
            type: 'text',
            name: 'fullName',
            label: 'Full Name',
            placeholder: 'Enter Full Name',
            required: true,
        },
        {
            type: 'email',
            name: 'email',
            label: 'Email',
            placeholder: 'Enter Email',
            required: true,
        },
    ];

    const inputElements = inputFields.map((field) => (
        <div className="w-full" key={field.name}>
            <div className="relative flex w-full justify-center items-center gap-4">
                <InputField
                    field={field}
                    handleChange={handleChange}
                    inputs={inputs}
                    className="w-full"
                    inputStyling={field.name === 'email' ? 'pr-18' : ''}
                />
                {field.name === 'email' && (
                    <div className="absolute right-2">
                        {isVerified ? (
                            <div className="flex items-center justify-center ">
                                <div className="size-5 stroke-green-600 fill-none mt-6 mr-2">
                                    {icons.tick}
                                </div>
                            </div>
                        ) : (
                            <Button
                                title="Verify email"
                                btnText={
                                    sendingMail ? (
                                        <div className="flex items-center justify-center">
                                            <div className="size-3 fill-[#4977ec] dark:text-[#a2bdff]">
                                                {icons.loading}
                                            </div>
                                        </div>
                                    ) : (
                                        'Verify'
                                    )
                                }
                                onClick={sendVerifyEmail}
                                className="rounded-sm mt-[22px] w-13 h-6.5 font-medium text-[12px] flex items-center justify-center bg-[#4977ec] text-white hover:bg-[#3b62c2] active:scale-[98%]"
                                disabled={sendingMail}
                            />
                        )}
                    </div>
                )}
            </div>
            {error[field.name] && (
                <div className="text-red-500 text-xs font-medium">
                    {error[field.name]}
                </div>
            )}
        </div>
    ));

    return (
        <div className="py-10 text-black flex flex-col items-center justify-center gap-4 min-h-screen">
            <Link to={'/'}>
                <div className="overflow-hidden rounded-full size-18 hover:brightness-95 shadow-sm">
                    <img
                        src={LOGO}
                        alt="peer connect logo"
                        className="object-cover size-full"
                    />
                </div>
            </Link>
            <div>
                <p className="text-center text-[22px] font-semibold">
                    Register a New Canteen
                </p>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.3 }}
                    className="h-[0.05rem] relative -top-1 bg-[#333333]"
                />
            </div>

            <div className="max-w-[500px] min-w-[300px] flex flex-col items-center justify-center gap-3">
                {error.root && (
                    <div className="text-red-500 w-full text-center">
                        {error.root}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col items-start justify-center gap-3 w-full"
                >
                    <div className="w-full flex justify-center mt-4">
                        <Dropdown options={hostels} setValue={setHostel} />
                    </div>

                    <div className="w-full flex flex-col gap-2">
                        {inputElements}

                        {/* phone number field */}
                        <div className="w-full">
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
                                    inputClass="!w-full !h-[42px] !indent-2 !rounded-md !border-1 !border-gray-400 !outline-[#f68533] !bg-transparent"
                                    buttonClass="!h-[42px] !w-[45px] !bg-white !hover:bg-white !z-[1] !rounded-r-none !rounded-md !border-1 !border-gray-400 !outline-[#f68533]"
                                />
                            </div>
                            {error.phoneNumber && (
                                <div className="text-red-500 text-xs font-medium">
                                    {error.phoneNumber}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="w-full mt-2">
                        <Button
                            type="submit"
                            className="text-white rounded-md py-2 mt-2 h-[40px] flex items-center justify-center w-full bg-[#4977ec] hover:bg-[#3b62c2] transition-all duration-200 hover:shadow-md active:scale-[98%]"
                            disabled={disabled}
                            onMouseOver={onMouseOver}
                            btnText={
                                loading ? (
                                    <div className="size-5 fill-[#4977ec] dark:text-[#a2bdff]">
                                        {icons.loading}
                                    </div>
                                ) : (
                                    'Register'
                                )
                            }
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}

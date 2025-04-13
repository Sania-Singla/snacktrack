import { useEffect, useState } from 'react';
import { contractorService, userService } from '../Services';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Dropdown, InputField } from '../Components';
import { verifyExpression } from '../Utils';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { usePopupContext } from '../Contexts';
import { LOGO } from '../Constants/constants';
import { motion } from 'framer-motion';
import { icons } from '../Assets/icons';
import toast from 'react-hot-toast';

export default function RegisterCanteenPage() {
    const initialInputs = {
        fullName: '',
        password: '',
        phoneNumber: '',
        email: '',
        kitchenKey: '',
    };
    const [inputs, setInputs] = useState(initialInputs);
    const [error, setError] = useState({});
    const { setPopupInfo, setShowPopup } = usePopupContext();
    const [disabled, setDisabled] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showkitchenKey, setShowKitchenKey] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [hostel, setHostel] = useState({});
    const [hostels, setHostels] = useState([]);

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

    useEffect(() => {
        (async function () {
            try {
                const res = await userService.getCanteens();
                if (res)
                    setHostels([
                        { label: 'Select Hostel', value: '' },
                        ...res.map((h) => ({
                            label: `${h.hostelType}${h.hostelNumber}-${h.hostelName}`,
                            value: h,
                        })),
                    ]);
            } catch (err) {
                navigate('/server-error');
            }
        })();
    }, []);

    function handleDisable() {
        return (
            Object.values(inputs).some((value) => !value) ||
            !hostel ||
            Object.entries(error).some(
                ([key, value]) => value && key !== 'root'
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
            const res = await contractorService.register({ hostel, ...inputs });
            if (res && res.message === 'Verification code sent') {
                toast.success('Verification code sent to your email');
                setShowPopup(true);
                setPopupInfo({
                    type: 'verifyEmail',
                    target: { hostel, ...inputs },
                });
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
        {
            type: showPassword ? 'text' : 'password',
            name: 'password',
            label: 'Password',
            placeholder: 'Create New Password',
            required: true,
        },
        {
            type: showkitchenKey ? 'text' : 'password',
            name: 'kitchenKey',
            label: 'Kitchen Key',
            placeholder: 'Create New Kitchen Key',
            required: true,
        },
    ];

    const inputElements = inputFields.map((field) => (
        <div className="w-full" key={field.name}>
            <InputField
                field={field}
                handleChange={handleChange}
                inputs={inputs}
                showPassword={
                    field.name === 'kitchenKey' ? showkitchenKey : showPassword
                }
                setShowPassword={
                    field.name === 'kitchenKey'
                        ? setShowKitchenKey
                        : setShowPassword
                }
            />
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
                <div className="overflow-hidden rounded-full size-[90px] hover:brightness-95 drop-shadow-md">
                    <img
                        src={LOGO}
                        alt="peer connect logo"
                        className="object-cover size-full"
                    />
                </div>
            </Link>
            <div>
                <p className="text-center px-2 text-[28px] font-medium">
                    Register a New Canteen
                </p>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.3 }}
                    className="relative -top-1 h-[0.1rem] bg-[#333333]"
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
                    className="flex flex-col items-start justify-center gap-4 w-full"
                >
                    <div className="w-full flex justify-center mt-4">
                        <Dropdown options={hostels} setValue={setHostel} />
                    </div>

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

import { useState } from 'react';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { contractorService } from '../Services';
import { useNavigate, Link } from 'react-router-dom';
import { Button, InputField } from '../Components';
import { verifyExpression, checkTokenExpired } from '../Utils';
import { LOGO } from '../Constants';
import { motion } from 'framer-motion';
import { icons } from '../Assets/icons';
import toast from 'react-hot-toast';
import { useUserContext } from '../Contexts';

export default function RegisterStudentPage() {
    const initialInputs = {
        fullName: '',
        phoneNumber: '',
        email: '',
        rollNo: '',
    };
    const [phoneKey, setPhoneKey] = useState(0);
    const [inputs, setInputs] = useState(initialInputs);
    const [error, setError] = useState({});
    const [disabled, setDisabled] = useState(true);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { user, setUser } = useUserContext();

    function handleChange(e) {
        let { value, name } = e.target;

        // ✅ Remove leading zeroes only for rollNo
        if (name === 'rollNo') {
            value = value.replace(/^0+/, '');
        }
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

    function handleDisable() {
        return (
            Object.values(inputs).some((value) => !value) ||
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
            const res = await contractorService.registerStudent({
                ...inputs,
                hostelType: user.hostelType,
                hostelNumber: user.hostelNumber,
            });
            if (res && !res.message) {
                toast.success('Account created successfully');
                setInputs(initialInputs);
                setPhoneKey((prev) => prev + 1);
            } else if (res && res.message !== 'tokens missing') {
                setError((prev) => ({ ...prev, root: res.message }));
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
            type: 'number',
            name: 'rollNo',
            label: 'Roll No',
            placeholder: 'Enter Hostel Roll Number',
            required: true,
        },
        {
            type: 'text',
            name: 'fullName',
            label: 'FullName',
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
            <InputField
                field={field}
                handleChange={handleChange}
                inputs={inputs}
            />
            {field.name !== 'password' && error[field.name] && (
                <div className="text-red-500 text-xs font-medium">
                    {error[field.name]}
                </div>
            )}
        </div>
    ));

    return (
        <div className="py-10 text-black flex flex-col items-center justify-center gap-4 min-h-screen">
            <Link
                to={'/'}
                className="w-fit flex items-center justify-center hover:brightness-95"
            >
                <div className="overflow-hidden rounded-full size-18 shadow-sm">
                    <img
                        src={LOGO}
                        alt="peer connect logo"
                        className="object-cover size-full"
                    />
                </div>
            </Link>
            <div className="w-fit">
                <p className="text-center text-[22px] font-semibold">
                    Register New Student
                </p>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.3 }}
                    className="relative -top-1 h-[0.05rem] bg-[#333333]"
                />
            </div>

            <div className="max-w-[500px] min-w-[300px] flex flex-col items-center justify-center">
                <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    name="excel"
                    id="excel"
                    onChange={() => {}}
                />

                <label
                    htmlFor="excel"
                    className="border mt-3 h-10 flex gap-2.5 items-center justify-center transition-all duration-200 hover:bg-[#4977ec]/10 active:scale-[98%] cursor-pointer text-center border-[#4977ec] rounded-md w-full"
                >
                    <span className="text-[#4977ec] text-[15px] font-medium">
                        Upload Excel
                    </span>
                    <div className="size-5.5 fill-[#4977ec]">
                        {icons.upload}
                    </div>
                </label>

                <div className="flex gap-2 items-center w-full mt-3">
                    <hr className="text-gray-300 w-full" />
                    <p className="text-gray-400 text-sm font-light pb-1">or</p>
                    <hr className="text-gray-300 w-full" />
                </div>

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
                        <div className="w-full">
                            <div className="bg-white z-[10] text-sm ml-2 px-1 w-fit relative top-3 font-medium">
                                <label htmlFor="phoneNumber">
                                    <span className="text-red-500">* </span>
                                    Phone Number
                                </label>
                            </div>
                            <div className="w-full">
                                <PhoneInput
                                    key={phoneKey}
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

                    <Button
                        type="submit"
                        className="text-white rounded-md py-2 mt-3 h-[40px] flex items-center justify-center w-full transition-all duration-200 bg-[#4977ec] hover:bg-[#3b62c2] hover:shadow-md active:scale-[98%]"
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
                </form>
            </div>
        </div>
    );
}

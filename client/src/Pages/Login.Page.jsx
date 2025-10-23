import { LOGO } from '../Constants';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useUserContext } from '../Contexts';
import { userService } from '../Services';
import { Button, Dropdown, InputField } from '../Components';
import { icons } from '../Assets/icons';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const [inputs, setInputs] = useState({ userName: '', password: '' });
    const [hostel, setHostel] = useState('');
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const { setUser } = useUserContext();
    const navigate = useNavigate();
    const [hostels, setHostels] = useState([
        { value: '', label: 'Select Hostel' },
    ]);

    function handleChange(e) {
        let { value, name } = e.target;
        // ✅ Remove leading zeroes only for rollNo
        if (name === 'rollNo') {
            value = value.replace(/^0+/, '');
        }
        setInputs((prev) => ({ ...prev, [name]: value }));
        onMouseOver();
    }

    function handleDisable() {
        if (!inputs.userName || !inputs.password || !hostel) {
            return true;
        } else return false;
    }

    function onMouseOver() {
        setDisabled(handleDisable());
    }

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        (async function () {
            try {
                const res = await userService.getCanteens(signal);
                if (res && !res.message) {
                    setHostels((prev) => [
                        ...prev,
                        ...res.map(
                            ({ hostelType, hostelNumber, hostelName }) => ({
                                value: hostelType + hostelNumber,
                                label:
                                    hostelType +
                                    hostelNumber +
                                    ' - ' +
                                    hostelName,
                            })
                        ),
                    ]);
                }
            } catch (err) {
                toast.error('Something went wrong. Please try again.');
            }
        })();

        return () => controller.abort();
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        if (handleDisable()) {
            toast.error('Please fill all fields correctly');
            return;
        }
        setLoading(true);
        setDisabled(true);
        try {
            const res = await userService.login({
                userName: `${hostel}-${inputs.userName}`,
                password: inputs.password,
            });

            if (res && !res.message) {
                toast.success('Logged in Successfully 😉');
                setUser(res);
                localStorage.removeItem('cartItems');
                navigate('/');
            } else toast.error(res.message);
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
            name: 'userName',
            label: 'Roll No',
            value: inputs.userName,
            placeholder: 'Enter your Roll no',
            required: true,
        },
        {
            type: showPassword ? 'text' : 'password',
            name: 'password',
            label: 'Password',
            value: inputs.password,
            placeholder: 'Enter password',
            required: true,
        },
    ];

    const inputElements = inputFields.map((field) => (
        <InputField
            key={field.name}
            field={field}
            handleChange={handleChange}
            inputs={inputs}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
        />
    ));

    return (
        <div className="text-black flex flex-col items-center justify-center gap-5 min-h-screen">
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
                <p className="text-center text-2xl font-medium">
                    Login to Your Account
                </p>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 0.3 }}
                    className="h-[0.05rem] relative -top-1 bg-[#333333]"
                />
            </div>

            <div className="text-black max-w-[500px] min-w-[300px] flex flex-col items-center gap-3">
                <Button
                    className="text-gray-800 rounded-md mt-3 h-[40px] flex items-center justify-center w-full transition-all duration-200 border-1 border-[#4977ec] hover:bg-[#4977ec]/10 hover:shadow-sm active:scale-[98%]"
                    btnText={
                        <div className="flex gap-2.5 items-center">
                            <span className="text-[#4977ec] text-[15px] font-medium">
                                Upload QR
                            </span>
                            <div className="size-5.5 fill-[#4977ec]">
                                {icons.upload}
                            </div>
                        </div>
                    }
                    disabled={loading}
                />

                <div className="flex gap-2 items-center w-full">
                    <hr className="text-gray-300 w-full" />
                    <p className="text-gray-400 text-sm font-light pb-1">or</p>
                    <hr className="text-gray-300 w-full" />
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="w-full flex flex-col gap-2"
                >
                    <div className="w-full flex justify-center">
                        <Dropdown options={hostels} setValue={setHostel} />
                    </div>

                    <div className="w-full flex flex-col gap-2">
                        {inputElements}
                    </div>

                    <Button
                        className="text-white rounded-md py-2 mt-4 h-[40px] flex items-center justify-center w-full transition-all duration-200 bg-[#4977ec] hover:bg-[#3b62c2] hover:shadow-md active:scale-[98%]"
                        onMouseOver={onMouseOver}
                        type="submit"
                        btnText={
                            loading ? (
                                <div className="size-5 fill-[#4977ec] dark:text-[#a2bdff]">
                                    {icons.loading}
                                </div>
                            ) : (
                                'Login'
                            )
                        }
                        disabled={disabled}
                    />
                </form>
            </div>
        </div>
    );
}

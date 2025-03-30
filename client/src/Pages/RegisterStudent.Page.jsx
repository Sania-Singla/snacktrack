import { useState } from 'react';
import { contractorService } from '../Services';
import { useNavigate, Link } from 'react-router-dom';
import { Button, InputField } from '../Components';
import { verifyExpression } from '../Utils';
import { LOGO } from '../Constants/constants';
import { motion } from 'framer-motion';
import { icons } from '../Assets/icons';
import toast from 'react-hot-toast';

export default function RegisterStudentPage() {
    const initialInputs = {
        fullName: '',
        phoneNumber: '',
        email: '',
        rollNo: '',
        password: '',
    };
    const [showPassword, setShowPassword] = useState(false);
    const [inputs, setInputs] = useState(initialInputs);
    const [error, setError] = useState({});
    const [disabled, setDisabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleChange(e) {
        const { value, name } = e.target;
        setInputs((prev) => ({ ...prev, [name]: value }));
    }

    const handleBlur = (e) => {
        let { name, value } = e.target;
        if (value && name !== 'password') {
            verifyExpression(name, value, setError);
        }
    };

    function onMouseOver() {
        if (
            Object.values(inputs).some((value) => !value) ||
            Object.entries(error).some(
                ([key, value]) => value && key !== 'root'
            )
        ) {
            setDisabled(true);
        } else setDisabled(false);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setDisabled(true);
        setError({});
        try {
            const res = await contractorService.registerStudent(inputs);
            if (res && !res.message) {
                toast.success('Account created successfully');
                setInputs(initialInputs);
            } else setError((prev) => ({ ...prev, root: res.message }));
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
            type: 'text',
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
        {
            type: 'text',
            name: 'phoneNumber',
            label: 'Phone Number',
            placeholder: 'Enter Phone Number',
            required: true,
        },
        {
            type: showPassword ? 'text' : 'password',
            name: 'password',
            label: "Contractor's Password",
            placeholder: 'Enter password to confirm',
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
                <div className="overflow-hidden rounded-full size-[90px] drop-shadow-md">
                    <img
                        src={LOGO}
                        alt="peer connect logo"
                        className="object-cover size-full"
                    />
                </div>
            </Link>
            <div className="w-fit">
                <p className="text-center px-2 text-[28px] font-medium">
                    Register a New Student
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
                    <div className="w-full flex flex-col gap-1">
                        {inputElements}
                    </div>

                    <div className="w-full">
                        <Button
                            type="submit"
                            className="text-white rounded-md py-2 mt-2 h-[40px] flex items-center justify-center text-lg w-full bg-[#4977ec] hover:bg-[#3b62c2]"
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

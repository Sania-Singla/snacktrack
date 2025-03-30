import { useState } from 'react';
import { contractorService } from '../../Services';
import { usePopupContext, useStudentContext } from '../../Contexts';
import { useNavigate } from 'react-router-dom';
import { Button, InputField } from '..';
import { verifyExpression, getRollNo } from '../../Utils';
import toast from 'react-hot-toast';
import { icons } from '../../Assets/icons';

export default function EditStudentPopup() {
    const { targetStudent, setStudents } = useStudentContext();
    const [inputs, setInputs] = useState({
        fullName: targetStudent?.fullName || '',
        rollNo: getRollNo(targetStudent?.userName) || '',
        password: '',
        contractorPassword: '',
        phoneNumber: targetStudent?.phoneNumber || '',
    });
    const [error, setError] = useState({});
    const [disabled, setDisabled] = useState(false);
    const { setShowPopup } = usePopupContext();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showContractorPassword, setShowContractorPassword] = useState(false);
    const navigate = useNavigate();

    async function handleChange(e) {
        const { value, name } = e.target;
        setInputs((prev) => ({ ...prev, [name]: value }));
    }

    const handleBlur = (e) => {
        let { name, value } = e.target;
        if (value) verifyExpression(name, value, setError);
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
        try {
            const res = await contractorService.updateStudentAccountDetails(
                targetStudent._id,
                inputs
            );
            if (res && !res.message) {
                toast.success('Details updated successfully 👍');
                setStudents((prev) =>
                    prev.map((student) => {
                        if (student._id === targetStudent._id) {
                            return {
                                ...student,
                                fullName: inputs.fullName,
                                phoneNumber: inputs.phoneNumber,
                                userName:
                                    targetStudent.userName.slice(0, 4) +
                                    inputs.rollNo,
                            };
                        } else return student;
                    })
                );
                setShowPopup(false);
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
            name: 'rollNo',
            label: 'Roll No',
            placeholder: 'Enter new Roll Number',
            required: true,
        },
        {
            type: 'text',
            name: 'fullName',
            label: 'FullName',
            placeholder: 'Enter new full name',
            required: true,
        },
        {
            type: 'text',
            name: 'phoneNumber',
            label: 'PhoneNumber',
            placeholder: 'Enter new Phone Number',
            required: true,
        },
        {
            type: showPassword ? 'text' : 'password',
            name: 'password',
            label: "Student's Password",
            placeholder: "Enter student's password",
            required: true,
        },
        {
            type: showContractorPassword ? 'text' : 'password',
            name: 'contractorPassword',
            label: 'Password',
            placeholder: 'Enter password to confirm update',
            required: true,
        },
    ];

    const inputElements = inputFields.map((field) =>
        field.name === 'password' || field.name === 'contractorPassword' ? (
            <InputField
                key={field.name}
                field={field}
                handleChange={handleChange}
                error={error}
                inputs={inputs}
                showPassword={
                    field.name === 'contractorPassword'
                        ? showContractorPassword
                        : showPassword
                }
                setShowPassword={
                    field.name === 'contractorPassword'
                        ? setShowContractorPassword
                        : setShowPassword
                }
            />
        ) : (
            <div className="w-full" key={field.name}>
                <InputField
                    field={field}
                    handleChange={handleChange}
                    error={error}
                    inputs={inputs}
                    handleBlur={handleBlur}
                />
                {error[field.name] && (
                    <div className="text-red-500 text-xs font-medium">
                        {error[field.name]}
                    </div>
                )}
            </div>
        )
    );

    return (
        <div className="relative w-[350px] sm:w-[450px] transition-all duration-300 bg-white rounded-xl overflow-hidden text-black p-5 flex flex-col items-center justify-center gap-3">
            <Button
                btnText={
                    <div className="size-[20px] stroke-black">
                        {icons.cross}
                    </div>
                }
                title="Close"
                onClick={() => setShowPopup(false)}
                className="absolute top-2 right-2"
            />

            <p className="text-2xl font-bold">Update Student Details</p>
            <p className="text-[15px]">
                <span className="font-medium">Roll No: </span>
                {getRollNo(targetStudent.userName)}
            </p>

            <div className="w-full flex flex-col items-center justify-center gap-3 relative -top-2">
                {error.root && (
                    <div className="text-red-500 w-full text-center">
                        {error.root}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col items-start justify-center gap-2 w-full"
                >
                    {inputElements}

                    <div className="w-full">
                        <Button
                            type="submit"
                            className="text-white rounded-md py-2 mt-4 h-[45px] flex items-center justify-center text-lg w-full bg-[#4977ec] hover:bg-[#3b62c2]"
                            disabled={disabled}
                            onMouseOver={onMouseOver}
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
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}

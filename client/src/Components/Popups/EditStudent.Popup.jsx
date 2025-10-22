import { useState } from 'react';
import { contractorService } from '../../Services';
import {
    usePopupContext,
    useStudentContext,
    useUserContext,
} from '../../Contexts';
import { Button, InputField } from '..';
import { verifyExpression, getRollNo, checkTokenExpired } from '../../Utils';
import toast from 'react-hot-toast';
import { icons } from '../../Assets/icons';
import 'react-phone-input-2/lib/style.css';
import PhoneInput from 'react-phone-input-2';

export default function EditStudentPopup() {
    const { setShowPopup, popupInfo } = usePopupContext();
    const { setStudents } = useStudentContext();
    const [inputs, setInputs] = useState({
        fullName: popupInfo.student?.fullName || '',
        rollNo: getRollNo(popupInfo.student?.userName) || '',
        phoneNumber: popupInfo.student?.phoneNumber || '',
        email: popupInfo.student?.email || '',
    });
    const [error, setError] = useState({});
    const [disabled, setDisabled] = useState(true);
    const [loading, setLoading] = useState(false);
    const { user, setUser } = useUserContext();

    async function handleChange(e) {
        const { value, name } = e.target;
        setInputs((prev) => ({ ...prev, [name]: value }));
        value
            ? verifyExpression(name, value, setError)
            : setError((prev) => ({ ...prev, [name]: '' }));
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
            const res = await contractorService.updateStudent(
                popupInfo.student._id,
                {
                    ...inputs,
                    hostelType: user.hostelType,
                    hostelNumber: user.hostelNumber,
                }
            );
            if (res && !res.message) {
                toast.success('Details updated successfully 👍');
                setStudents((prev) =>
                    prev.map((s) => {
                        if (s._id === popupInfo.student._id) {
                            return {
                                ...s,
                                fullName: inputs.fullName,
                                phoneNumber: inputs.phoneNumber,
                                email: inputs.email,
                                userName:
                                    popupInfo.student.userName.slice(0, 4) +
                                    inputs.rollNo,
                            };
                        } else return s;
                    })
                );
                setShowPopup(false);
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

    function handlePhoneChange(value, country, e, formattedValue) {
        const name = e.target.name || 'phoneNumber'; // because when flag changes the name = undefiend
        setInputs((prev) => ({ ...prev, [name]: formattedValue }));
        if (value) verifyExpression(name, formattedValue, setError);
        else setError((prev) => ({ ...prev, [name]: '' }));
        onMouseOver();
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
            type: 'email',
            name: 'email',
            label: 'Email',
            placeholder: 'Enter new email',
            required: true,
        },
    ];

    const inputElements = inputFields.map((field) => (
        <div className="w-full" key={field.name}>
            <InputField
                field={field}
                handleChange={handleChange}
                error={error}
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

            <p className="text-2xl font-semibold">Update Student Details</p>
            <p className="text-[15px]">
                <span className="font-medium">Roll No: </span>
                {getRollNo(popupInfo.student.userName)}
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

                    <div className="w-full">
                        <Button
                            type="submit"
                            className="text-white rounded-md py-2 mt-2 h-[40px] flex items-center justify-center text-lg w-full transition-all duration-200 bg-[#4977ec] hover:bg-[#3b62c2] hover:shadow-md active:scale-[98%]"
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

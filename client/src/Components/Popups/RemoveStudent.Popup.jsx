import { Button } from '..';
import {
    usePopupContext,
    useStudentContext,
    useUserContext,
} from '../../Contexts';
import { icons } from '../../Assets/icons';
import { useNavigate } from 'react-router-dom';
import { contractorService } from '../../Services';
import { checkTokenExpired, getRollNo } from '../../Utils';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function RemoveStudentPopup() {
    const [loading, setLoading] = useState(false);
    const { setShowPopup, popupInfo } = usePopupContext();
    const { setStudents, setStudentsInfo } = useStudentContext();
    const navigate = useNavigate();
    const [check, setCheck] = useState(false);
    const [disabled, setDisabled] = useState(true);
    const { setUser } = useUserContext();

    async function removeStudent() {
        if (!check) {
            toast.error('Please fill all fields correctly');
            return;
        }
        setLoading(true);
        setDisabled(true);
        try {
            const res = await contractorService.removeStudent(
                popupInfo.student._id
            );
            if (res && res.message === 'account deleted successfully') {
                setStudents((prev) =>
                    prev.filter(
                        (student) => student._id !== popupInfo.student._id
                    )
                );
                setStudentsInfo((prev) => ({
                    ...prev,
                    totalCount: prev.totalCount - 1,
                }));
                toast.success('Account Deleted Successfully 😕');
            } else if (res && res.message !== 'tokens missing') {
                toast.error(res?.message);
            } else checkTokenExpired(res, setUser);
        } catch (err) {
                        toast.error('Something went wrong. Please try again.');

        } finally {
            setDisabled(false);
            setLoading(false);
            setShowPopup(false);
        }
    }

    return (
        <div className="relative w-[350px] sm:w-[450px] transition-all duration-300 bg-white rounded-xl overflow-hidden text-black p-5 flex flex-col items-center justify-center gap-4">
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

            <div className="flex flex-col gap-3">
                <p className="text-2xl font-bold text-center">
                    Remove Student Account
                </p>
                <p className="text-[15px] text-center">
                    <span className="font-medium">Roll No: </span>
                    {getRollNo(popupInfo.student.userName)}
                </p>

                <div className="w-full flex flex-row-reverse gap-3 mt-2 items-start">
                    <label
                        htmlFor="delete student"
                        className="text-sm cursor-pointer text-gray-700 relative -top-2"
                    >
                        are you sure you want to remove this student ? although
                        you can register them again in the future.
                    </label>
                    <input
                        type="checkbox"
                        checked={check}
                        id="delete student"
                        className="cursor-pointer"
                        onChange={(e) => {
                            setCheck(e.target.checked);
                            setDisabled(!e.target.checked);
                        }}
                    />
                </div>

                <Button
                    btnText={
                        loading ? (
                            <div className="flex items-center justify-center w-full">
                                <div className="size-5 fill-red-700 dark:text-[#e95555]">
                                    {icons.loading}
                                </div>
                            </div>
                        ) : (
                            'Delete'
                        )
                    }
                    onClick={removeStudent}
                    disabled={disabled}
                    className="text-white relative -top-2 rounded-md py-2 px-3 flex items-center justify-center w-full bg-red-700 hover:bg-red-800 transition-all duration-200 hover:shadow-md active:scale-[98%]"
                />
            </div>
        </div>
    );
}

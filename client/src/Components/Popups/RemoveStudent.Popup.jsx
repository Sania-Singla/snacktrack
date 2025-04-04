import { Button } from '..';
import { usePopupContext, useStudentContext } from '../../Contexts';
import { icons } from '../../Assets/icons';
import { useNavigate } from 'react-router-dom';
import { contractorService } from '../../Services';
import { getRollNo } from '../../Utils';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function RemoveStudentPopup() {
    const [loading, setLoading] = useState(false);
    const { setShowPopup, popupInfo } = usePopupContext();
    const { setStudents } = useStudentContext();
    const navigate = useNavigate();
    const [check, setCheck] = useState(false);
    const [disabled, setDisabled] = useState(false);

    async function removeStudent() {
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
                toast.success('Account Deleted Successfully 😕');
            } else toast.error(res?.message);
        } catch (err) {
            navigate('/server-error');
        } finally {
            setDisabled(false);
            setLoading(false);
            setShowPopup(false);
        }
    }

    function onMouseOver() {
        setDisabled(!check);
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
                        onChange={(e) => setCheck(e.target.checked)}
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
                    onMouseOver={onMouseOver}
                    disabled={disabled}
                    className="text-white relative -top-2 rounded-md w-full py-2 px-3 bg-red-700 hover:bg-red-800"
                />
            </div>
        </div>
    );
}

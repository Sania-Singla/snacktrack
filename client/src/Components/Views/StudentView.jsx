import { useNavigate } from 'react-router-dom';
import { Button } from '..';
import { icons } from '../../Assets/icons';
import { usePopupContext, useStudentContext } from '../../Contexts';
import { getRollNo } from '../../Utils';

export default function StudentView({ student, reference }) {
    const { _id, avatar, fullName, userName, email, phoneNumber } = student;
    const { setShowPopup, setPopupInfo } = usePopupContext();
    const { setTargetStudent } = useStudentContext();
    const navigate = useNavigate();

    async function removeStudent() {
        setTargetStudent(student);
        setPopupInfo({ type: 'removeStudent' });
        setShowPopup(true);
    }

    async function editStudent() {
        setTargetStudent(student);
        setPopupInfo({ type: 'editStudent' });
        setShowPopup(true);
    }

    return (
        <div
            ref={reference}
            className="min-w-[250px] flex flex-col items-start justify-center gap-4 relative w-full p-3 bg-white drop-shadow-md rounded-2xl overflow-hidden"
        >
            <div className="w-full flex justify-between gap-4">
                <div className="flex items-center justify-start gap-4">
                    {/* avatar */}
                    <div>
                        <div className="size-[80px] overflow-hidden rounded-full drop-shadow-md">
                            <img
                                alt="student avatar"
                                src={avatar}
                                className="size-full object-cover"
                            />
                        </div>
                    </div>

                    {/* info */}
                    <div className="">
                        <div className="text-ellipsis line-clamp-1 hover:text-[#5c5c5c] text-[16px] font-semibold text-black w-fit">
                            {fullName}
                        </div>

                        <div className="text-black hover:text-[#5c5c5c] text-[12px] w-fit">
                            <span className="font-medium">Roll No: </span>
                            {getRollNo(userName)}
                        </div>

                        <div className="text-black hover:text-[#5c5c5c] text-[12px] w-fit">
                            <span className="font-medium">Phone Number: </span>{' '}
                            {phoneNumber}
                        </div>

                        <div className="text-black hover:text-[#5c5c5c] text-[12px] w-fit">
                            <span className="font-medium">Email: </span> {email}
                        </div>
                    </div>
                </div>

                <div className="w-fit flex flex-col gap-3 items-end justify-center">
                    <Button
                        btnText={
                            <div className="size-[15px] group-hover:fill-[#4977ec]">
                                {icons.edit}
                            </div>
                        }
                        className="bg-[#f0efef] p-2 group rounded-full drop-shadow-lg hover:bg-[#ebeaea]"
                        onClick={editStudent}
                    />
                    <div>
                        <Button
                            btnText={
                                <div className="size-[15px] group-hover:fill-red-700">
                                    {icons.delete}
                                </div>
                            }
                            className="bg-[#f0efef] p-2 group rounded-full drop-shadow-lg hover:bg-[#ebeaea]"
                            onClick={removeStudent}
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end w-full">
                <Button
                    onClick={() => navigate(`/orders/${_id}`)}
                    btnText="View Orders"
                    title="View Orders"
                    className="text-white rounded-md text-[15px] w-fit px-3 h-[30px] bg-[#4977ec] hover:bg-[#3b62c2]"
                />
            </div>
        </div>
    );
}

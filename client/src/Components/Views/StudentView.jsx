import { useNavigate } from 'react-router-dom';
import { Button, StudentBillCard } from '..';
import { icons } from '../../Assets/icons';
import { usePopupContext } from '../../Contexts';
import { getRollNo } from '../../Utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

export default function StudentView({ student, reference }) {
    const { _id, fullName, userName, email, phoneNumber, bills } = student;
    const { setShowPopup, setPopupInfo } = usePopupContext();
    const [expanded, setExpanded] = useState(false);
    const navigate = useNavigate();

    async function removeStudent() {
        setPopupInfo({ type: 'removeStudent', student });
        setShowPopup(true);
    }

    async function editStudent() {
        setPopupInfo({ type: 'editStudent', student });
        setShowPopup(true);
    }

    const month = new Date().getMonth() + 1; // Current month

    return (
        <div
            ref={reference}
            className="min-w-[250px] flex flex-col items-start justify-center gap-4 relative w-full p-3 bg-white drop-shadow-md rounded-2xl overflow-hidden h-fit"
        >
            <div className="w-full flex justify-between gap-4">
                <div className="flex items-center justify-start gap-4">
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

                <div className="flex flex-col justify-between items-end">
                    <div className="flex h-fit gap-3">
                        <Button
                            btnText={
                                <div className="size-4 fill-none stroke-black group-hover:stroke-[#4977ec]">
                                    {icons.editUnfilled}
                                </div>
                            }
                            className="bg-[#f0efef] p-2 group rounded-full shadow-sm hover:bg-[#ebeaea]"
                            onClick={editStudent}
                        />
                        <div>
                            <Button
                                btnText={
                                    <div className="size-4 group-hover:fill-red-700">
                                        {icons.delete}
                                    </div>
                                }
                                className="bg-[#f0efef] p-2 group rounded-full shadow-sm hover:bg-[#ebeaea]"
                                onClick={removeStudent}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-2">
                        <Button
                            className="text-white rounded-md w-fit text-nowrap text-[13px] px-[10px] py-1 bg-[#4977ec] hover:bg-[#3b62c2]"
                            btnText="Orders"
                            onClick={() =>
                                navigate(`/orders/${_id}?month=${month}`)
                            }
                        />

                        <Button
                            className="text-white rounded-md w-fit text-nowrap text-[13px] px-[10px] py-1 bg-[#4977ec] hover:bg-[#3b62c2]"
                            btnText={
                                <div className="flex gap-2 items-center">
                                    Bills
                                    <div
                                        className={`size-2.5 transition-transform fill-white ${
                                            expanded
                                                ? 'rotate-180 duration-200'
                                                : 'rotate-0 duration-500'
                                        }`}
                                        style={{ transformOrigin: 'center' }}
                                    >
                                        {icons.arrowDown}
                                    </div>
                                </div>
                            }
                            onClick={() => setExpanded(!expanded)}
                        />
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: '100%' }}
                        exit={{ height: 0 }}
                        className="p-1 pt-4 space-y-4 border-t w-full border-gray-300"
                    >
                        {bills.length > 0 ? (
                            bills.map((b) => (
                                <StudentBillCard
                                    studentInfo={student}
                                    bill={b}
                                    key={b._id}
                                />
                            ))
                        ) : (
                            <span className="italic text-sm text-gray-500">
                                No bills found
                            </span>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

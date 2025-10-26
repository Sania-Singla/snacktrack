import { useNavigate } from 'react-router-dom';
import { Button, StudentBillCard } from '..';
import { icons } from '../../Assets/icons';
import { usePopupContext, useUserContext } from '../../Contexts';
import { getRollNo } from '../../Utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

export default function StudentView({ student, reference }) {
    const { _id, fullName, userName, email, phoneNumber, bills } = student;
    const { setShowPopup, setPopupInfo } = usePopupContext();
    const [expanded, setExpanded] = useState(false);
    const navigate = useNavigate();
    const { user } = useUserContext();

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
            className="min-w-[250px] flex flex-col items-start justify-center gap-4 relative w-full p-3 bg-white shadow-xs border-1 border-gray-100 rounded-md overflow-hidden h-fit"
        >
            <div className="w-full flex justify-between gap-4">
                <div className="flex flex-col justify-between">
                    <div className="text-ellipsis line-clamp-1 hover:text-[#5c5c5c] text-[16px] font-semibold text-black w-fit">
                        {fullName}
                    </div>

                    <div className="text-black hover:text-[#5c5c5c] text-[12px] w-fit">
                        <span className="font-medium">Roll No: </span>
                        {getRollNo(userName)}
                    </div>

                    {user.role === 'admin' && (
                        <>
                            {' '}
                            <div className="text-black hover:text-[#5c5c5c] text-[12px] w-fit">
                                <span className="font-medium">
                                    Phone Number:{' '}
                                </span>{' '}
                                {phoneNumber}
                            </div>
                            <div className="text-black hover:text-[#5c5c5c] text-[12px] w-fit">
                                <span className="font-medium">Email: </span>{' '}
                                {email}
                            </div>
                        </>
                    )}
                </div>

                <div className="flex flex-col justify-between items-end gap-3">
                    {user.role === 'admin' && (
                        <div className="flex h-fit gap-3">
                            <Button
                                btnText={
                                    <div className="size-3.5 fill-none stroke-black group-hover:stroke-[#4977ec]">
                                        {icons.editUnfilled}
                                    </div>
                                }
                                className="bg-[#f0efef] p-1.5 group rounded-md shadow-xs hover:bg-[#ebeaea]"
                                onClick={editStudent}
                            />
                            <Button
                                btnText={
                                    <div className="size-3.5 group-hover:fill-red-700">
                                        {icons.delete}
                                    </div>
                                }
                                className="bg-[#f0efef] p-1.5 group rounded-md shadow-xs hover:bg-[#ebeaea]"
                                onClick={removeStudent}
                            />
                        </div>
                    )}

                    <div className="flex items-end h-full">
                        <div className="flex items-center justify-center gap-2">
                            <Button
                                className="text-white rounded w-fit text-nowrap text-xs px-2 py-[3px] bg-[#4977ec] hover:bg-[#3b62c2]"
                                btnText="Orders"
                                onClick={() =>
                                    navigate(`/orders/${_id}?month=${month}`)
                                }
                            />

                            <Button
                                className="text-white rounded w-fit text-nowrap text-xs px-2 py-[3px] bg-[#4977ec] hover:bg-[#3b62c2]"
                                btnText={
                                    <div className="flex gap-2 items-center">
                                        Bills
                                        <div
                                            className={`size-2 transition-transform fill-white ${
                                                expanded
                                                    ? 'rotate-180 duration-200'
                                                    : 'rotate-0 duration-500'
                                            }`}
                                            style={{
                                                transformOrigin: 'center',
                                            }}
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

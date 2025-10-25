import { getRollNo } from '../../Utils';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserContext } from '../../Contexts';
import { Button } from '..';
import { AnimatePresence, motion } from 'framer-motion';
import { icons } from '../../Assets/icons';
import { useState } from 'react';

export default function StudentBillCard({ bill, studentInfo }) {
    const { _id, month, year, amount, tax, grandTotal } = bill;
    const { user } = useUserContext();
    const { studentId } = useParams();
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="rounded-md shadow-xs border-1 border-gray-200 transition-all bg-white hover:shadow-md h-fit cursor-pointer px-3 py-2">
            <div
                onClick={() => setExpanded(!expanded)}
                className="flex justify-between gap-4"
            >
                <div className="flex items-center gap-3">
                    {/* Month/year badge */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 size-12 rounded-lg flex items-center justify-center border border-blue-400">
                        <div className="text-center">
                            <p className="text-sm font-bold text-blue-800 leading-none">
                                {new Date(
                                    year,
                                    month - 1,
                                    1
                                ).toLocaleDateString('default', {
                                    month: 'short',
                                })}
                            </p>
                            <p className="text-sm font-bold text-blue-800 mt-[2px]">
                                {year}
                            </p>
                        </div>
                    </div>

                    <div className="h-[60px] flex items-center justify-between pb-[5px]">
                        {user._id !== studentId ? (
                            <div className="leading-5">
                                <div className="hover:text-[#5c5c5c] text-[15px] font-semibold text-black">
                                    {studentInfo.fullName}
                                </div>

                                <div className="text-gray-800 hover:text-[#5c5c5c] text-xs w-fit">
                                    <span className="font-medium">
                                        Roll No:{' '}
                                    </span>
                                    {getRollNo(studentInfo.userName)}
                                </div>

                                {/* <div className="text-gray-800 hover:text-[#5c5c5c] text-xs w-fit">
                                    <span className="font-medium">
                                        Phone Number:{' '}
                                    </span>
                                    {studentInfo.phoneNumber}
                                </div> */}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-[2px]">
                                <h2 className="font-medium text-sm text-gray-800">
                                    BILL
                                </h2>
                                <h2 className="text-xs text-gray-500">
                                    BILL#{_id.slice(-8).toUpperCase()}
                                </h2>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex flex-col items-end justify-between h-full gap-2">
                    <span className="font-semibold text-[16px] text-gray-900">
                        ₹{amount.toFixed(2)}
                    </span>

                    <div className="flex items-center gap-2">
                        <Button
                            btnText="Orders"
                            className="text-white rounded-sm w-fit text-nowrap text-xs px-2 py-[3px] bg-[#4977ec] hover:bg-[#3b62c2]"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/orders/${studentInfo._id}`);
                            }}
                        />

                        <div
                            className={`transition-transform ${expanded ? 'rotate-180' : ''} size-3 fill-gray-500`}
                        >
                            {icons.arrowDown}
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ opacity: 0, maxHeight: 0 }}
                        animate={{ opacity: 1, maxHeight: 1000 }}
                        exit={{ opacity: 0, maxHeight: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden border-t mt-3 space-y-0.5 pt-2.5 border-gray-100"
                    >
                        <div className="flex justify-between text-[0.8rem] text-gray-600">
                            <p>Subtotal</p>
                            <p>₹{amount.toFixed(2)}</p>
                        </div>
                        <div className="flex justify-between text-[0.8rem] text-gray-600">
                            <p>Tax</p>
                            <p>₹{tax.toFixed(2)}</p>
                        </div>
                        <div className="flex justify-between font-medium text-[0.8rem] text-gray-600">
                            <p>GrandTotal</p>
                            <p>₹{grandTotal.toFixed(2)}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

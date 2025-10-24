import { getRollNo } from '../../Utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '..';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { icons } from '../../Assets/icons';

export default function BillCard({ bill, reference }) {
    const { _id, month, year, amount, grandTotal, tax, studentInfo } = bill;
    const { fullName, userName, email, phoneNumber } = studentInfo;
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState(false);

    return (
        <div
            ref={reference}
            className="bg-white p-3 cursor-pointer rounded-md shadow-xs border-1 border-gray-100 overflow-hidden transition-all hover:shadow-md h-fit"
        >
            <div
                onClick={() => setExpanded(!expanded)}
                className="flex justify-between gap-4"
            >
                {/* info */}
                <div>
                    <div className="hover:text-[#5c5c5c] text-[16px] font-semibold text-black">
                        {fullName}
                    </div>

                    <div className="text-black hover:text-[#5c5c5c] text-[12px] w-fit">
                        <span className="font-medium">Roll No: </span>
                        {getRollNo(userName)}
                    </div>

                    <div className="text-black hover:text-[#5c5c5c] text-[12px] w-fit">
                        <span className="font-medium">Phone Number: </span>
                        {phoneNumber}
                    </div>

                    <div className="text-black hover:text-[#5c5c5c] text-[12px] w-fit">
                        <span className="font-medium">Email: </span>
                        {email}
                    </div>
                </div>

                <div>
                    <div className="flex flex-col justify-between h-full items-end">
                        <p className="font-semibold text-lg text-gray-900">
                            ₹{grandTotal.toFixed(2)}
                        </p>

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

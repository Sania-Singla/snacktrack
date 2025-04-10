import { useUserContext } from '../../Contexts';
import { formatTime, getRollNo } from '../../Utils';
import { icons } from '../../Assets/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Button } from '..';
import { useNavigate } from 'react-router-dom';
import { billService } from '../../Services';

export default function BillCard({ bill }) {
    const { _id, studentInfo, month, year, amount } = bill;
    const [paid, setPaid] = useState(bill.paid);
    const [paidOn, setPaidOn] = useState(bill.paidOn);
    const { user } = useUserContext();
    const [expanded, setExpanded] = useState(false);
    const navigate = useNavigate();

    async function markPaid() {
        try {
            const res = await billService.markPaid(_id);
            if (res && res.message === 'bill marked as paid') {
                setPaid(true);
                setPaidOn(new Date());
            }
        } catch (err) {
            navigate('/server-error');
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md h-fit"
        >
            <div
                className="p-3 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-3">
                        {/* Month/year badge */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 size-11 rounded-lg flex items-center justify-center border border-blue-400">
                            <div className="text-center">
                                <p className="text-xs font-bold text-blue-800 leading-none">
                                    {new Date(
                                        year,
                                        month - 1,
                                        1
                                    ).toLocaleDateString('default', {
                                        month: 'short',
                                    })}
                                </p>
                                <p className="text-xs font-bold text-blue-800 mt-[2px]">
                                    {year}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 mb-1">
                            <h2 className="text-xs font-medium text-gray-800">
                                BILL
                            </h2>
                            <p className="text-xs text-gray-500">
                                #{_id.slice(-8).toUpperCase()}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-end flex-col gap-[5px]">
                        <span
                            className={`px-2 py-[3px] text-xs font-bold rounded-full ${
                                paid
                                    ? 'bg-green-50 text-green-700'
                                    : 'bg-yellow-50 text-yellow-700'
                            }`}
                        >
                            {paid ? 'Paid' : 'Pending'}
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-[16px] text-gray-900">
                                ₹{amount.toFixed(2)}
                            </span>
                            <div
                                className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
                            >
                                <div className="size-[10px] fill-gray-500">
                                    {icons.arrowDown}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="p-3 pt-0 border-t border-gray-100">
                            {/* Student Details (only if different user) */}
                            {bill.studentInfo._id !== user._id && (
                                <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="size-[55px] rounded-full drop-shadow-sm overflow-hidden flex items-center justify-center">
                                            <img
                                                src={studentInfo.avatar}
                                                alt={studentInfo.fullName}
                                                className="size-full object-cover"
                                            />
                                        </div>
                                        <div className="flex flex-col gap-[1px]">
                                            <h4 className="font-bold text-sm text-gray-800">
                                                {studentInfo.fullName}
                                            </h4>
                                            <div className="text-xs text-gray-700">
                                                <span className="font-medium">
                                                    Roll No:{' '}
                                                </span>
                                                {getRollNo(
                                                    studentInfo.userName
                                                )}
                                            </div>
                                            <div className="text-xs text-gray-700">
                                                <span className="font-medium">
                                                    Phone:{' '}
                                                </span>
                                                <span>
                                                    {studentInfo.phoneNumber}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Payment Details */}
                            <div className="mt-4 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">
                                        Amount Due
                                    </span>
                                    <span className="font-bold text-gray-900">
                                        ₹{amount.toFixed(2)}
                                    </span>
                                </div>

                                {paid ? (
                                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <div className="size-4 fill-green-600">
                                                {icons.check}
                                            </div>
                                            <span>Paid on</span>
                                        </div>
                                        <span className="text-sm text-gray-600">
                                            {formatTime(paidOn)}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex justify-end gap-2 items-center pt-3 border-t border-gray-100">
                                        <Button
                                            btnText="Get Orders"
                                            className="text-white rounded-md w-fit text-nowrap text-sm px-[10px] py-[3px] bg-[#4977ec] hover:bg-[#3b62c2]"
                                            onClick={() =>
                                                navigate(
                                                    `/orders/${studentInfo._id}?filter=${month}`
                                                )
                                            }
                                        />
                                        {user.role === 'contractor' && (
                                            <Button
                                                btnText="Mark Paid"
                                                className="text-white rounded-md w-fit text-nowrap text-sm px-[10px] py-[3px] bg-[#4977ec] hover:bg-[#3b62c2]"
                                                onClick={markPaid}
                                            />
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

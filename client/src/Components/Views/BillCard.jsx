import { useUserContext } from '../../Contexts';
import { checkTokenExpired, formatTime, getRollNo } from '../../Utils';
import { icons } from '../../Assets/icons';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from '..';
import { useNavigate } from 'react-router-dom';
import { billService } from '../../Services';

export default function BillCard({ bill }) {
    const { _id, month, year, amount, studentInfo } = bill;
    const { avatar, fullName, userName, email, phoneNumber, studentId } =
        studentInfo;
    const [paid, setPaid] = useState(bill.paid);
    const [paidOn, setPaidOn] = useState(bill.paidOn);
    const { user, setUser } = useUserContext();
    const [expanded, setExpanded] = useState(false);
    const navigate = useNavigate();

    async function markPaid() {
        try {
            const res = await billService.markPaid(_id);
            if (res && res.message === 'bill marked as paid') {
                setPaid(true);
                setPaidOn(new Date());
            } else checkTokenExpired(res, setUser);
        } catch (err) {
            navigate('/server-error');
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            onClick={() => setExpanded(!expanded)}
            className="bg-white p-3 cursor-pointer rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md h-fit border border-gray-200"
        >
            <div className="flex justify-between items-center w-full">
                <div className="flex items-center justify-start gap-4">
                    {/* info */}
                    <div className="space-y-1">
                        <div className="text-ellipsis line-clamp-1 hover:text-[#5c5c5c] w-fit">
                            <span className="text-[16px] font-semibold text-black">
                                {fullName}
                            </span>{' '}
                            &bull;{' '}
                            <span className="text-gray-600 text-sm">
                                {' '}
                                Roll No: {getRollNo(userName)}
                            </span>
                        </div>

                        <div className="text-gray-600 text-sm w-fit">
                            {phoneNumber}
                        </div>
                    </div>
                </div>
                <div className="space-y-2">
                    <p
                        className={`px-2 py-[3px] text-xs font-bold text-center rounded-full ${
                            paid
                                ? 'bg-green-50 text-green-700'
                                : 'bg-yellow-50 text-yellow-700'
                        }`}
                    >
                        {paid ? 'Paid' : 'Pending'}
                    </p>
                    <p className="font-semibold text-base text-gray-900">
                        ₹{amount.toFixed(2)}
                    </p>
                </div>
            </div>

            <div className="items-center">
                {paid && (
                    <div className="flex justify-between items-center  mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="size-4 fill-green-600">
                                {icons.check}
                            </div>
                            <span>Paid on</span>
                        </div>
                        <span className="text-xs text-gray-600">
                            {formatTime(paidOn)}
                        </span>
                    </div>
                )}
                <div className="flex justify-end gap-2 items-center mt-3 pt-3 border-t border-gray-100">
                    <Button
                        btnText="Get Orders"
                        className="text-white rounded-md w-fit text-nowrap text-sm px-[10px] py-[3px] bg-[#4977ec] hover:bg-[#3b62c2]"
                        onClick={() =>
                            navigate(`/orders/${studentId}?filter=${month}`)
                        }
                    />
                    {user.role === 'contractor' && !paid && (
                        <Button
                            btnText="Mark Paid"
                            className="text-white rounded-md w-fit text-nowrap text-sm px-[10px] py-[3px] bg-[#4977ec] hover:bg-[#3b62c2]"
                            onClick={markPaid}
                        />
                    )}
                </div>
            </div>
        </motion.div>
    );
}

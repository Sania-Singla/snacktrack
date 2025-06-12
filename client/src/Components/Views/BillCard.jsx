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
    const { avatar, fullName, userName, email, phoneNumber } = studentInfo;
    const [paid, setPaid] = useState(bill.paid);
    const [paidOn, setPaidOn] = useState(bill.paidOn);
    const { user, setUser } = useUserContext();
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
            className="bg-white p-3 cursor-pointer rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md h-fit border border-gray-200"
        >
            <div className="flex justify-between w-full h-full">
                {/* info */}
                <div className="flex items-center justify-start gap-4">
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
                    <p
                        className={`px-2 py-[3px] text-[12px] font-bold text-center rounded-full ${
                            paid
                                ? 'bg-green-50 text-green-700'
                                : 'bg-yellow-50 text-yellow-700'
                        }`}
                    >
                        {paid ? 'Paid' : 'Pending'}
                    </p>
                    <p className="font-semibold text-lg text-gray-900">
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
                        btnText="Orders"
                        className="text-white rounded-md w-fit text-nowrap text-sm px-[10px] py-[3px] bg-[#4977ec] hover:bg-[#3b62c2]"
                        onClick={() =>
                            navigate(
                                `/orders/${studentInfo._id}?month=${month}`
                            )
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

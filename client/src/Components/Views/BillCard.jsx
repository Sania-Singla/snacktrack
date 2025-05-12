import { useUserContext } from '../../Contexts';
import { checkTokenExpired, formatTime } from '../../Utils';
import { icons } from '../../Assets/icons';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from '..';
import { useNavigate } from 'react-router-dom';
import { billService } from '../../Services';

export default function BillCard({ bill }) {
    const { _id, month, year, amount, studentId } = bill;
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
                        <span className="text-xs text-gray-600">
                            #{_id.slice(-8).toUpperCase()}
                        </span>
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
                    <span className="font-semibold text-[16px] text-gray-900">
                        ₹{amount.toFixed(2)}
                    </span>
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

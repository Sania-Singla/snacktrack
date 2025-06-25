import { getRollNo } from '../../Utils';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from '../../Contexts';
import Button from '../General/Button';

export default function StudentBillCard({ bill, studentInfo }) {
    const { _id, month, year, amount } = bill;
    const { user } = useUserContext();
    const navigate = useNavigate();

    return (
        <div className="rounded-xl shadow-sm transition-all hover:shadow-md h-fit cursor-pointer px-3 py-2 flex justify-between">
            <div className="flex items-center gap-3">
                {/* Month/year badge */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 size-12 rounded-lg flex items-center justify-center border border-blue-400">
                    <div className="text-center">
                        <p className="text-sm font-bold text-blue-800 leading-none">
                            {new Date(year, month - 1, 1).toLocaleDateString(
                                'default',
                                {
                                    month: 'short',
                                }
                            )}
                        </p>
                        <p className="text-sm font-bold text-blue-800 mt-[2px]">
                            {year}
                        </p>
                    </div>
                </div>

                <div className="h-[60px] flex items-center justify-between pb-[5px]">
                    {user.role === 'student' ? (
                        <div className="leading-5">
                            <div className="hover:text-[#5c5c5c] text-[15px] font-semibold text-black">
                                {studentInfo.fullName}
                            </div>

                            <div className="text-gray-800 hover:text-[#5c5c5c] text-xs w-fit">
                                <span className="font-medium">Roll No: </span>
                                {getRollNo(studentInfo.userName)}
                            </div>

                            <div className="text-gray-800 hover:text-[#5c5c5c] text-xs w-fit">
                                <span className="font-medium">
                                    Phone Number:{' '}
                                </span>
                                {studentInfo.phoneNumber}
                            </div>
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

                <Button
                    btnText="Orders"
                    className="text-white rounded-md w-fit text-nowrap text-sm px-[10px] py-[3px] bg-[#4977ec] hover:bg-[#3b62c2]"
                    onClick={() =>
                        navigate(`/orders/${studentInfo._id}?month=${month}`)
                    }
                />
            </div>
        </div>
    );
}

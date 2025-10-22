import { getRollNo } from '../../Utils';
import { motion } from 'framer-motion';
import { Button } from '..';
import { useNavigate } from 'react-router-dom';

export default function BillCard({ bill, reference }) {
    const { _id, month, year, amount, studentInfo } = bill;
    const { fullName, userName, email, phoneNumber } = studentInfo;
    const navigate = useNavigate();

    return (
        <motion.div
            ref={reference}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flex justify-between gap-4 bg-white p-3 cursor-pointer rounded-md shadow-sm overflow-hidden transition-all hover:shadow-md h-fit border border-gray-200"
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
                        ₹{amount.toFixed(2)}
                    </p>
                    <Button
                        btnText="Orders"
                        className="text-white rounded-md w-fit text-nowrap text-sm px-[10px] py-[3px] bg-[#4977ec] hover:bg-[#3b62c2]"
                        onClick={() => navigate(`/orders/${studentInfo._id}`)}
                    />
                </div>
            </div>
        </motion.div>
    );
}

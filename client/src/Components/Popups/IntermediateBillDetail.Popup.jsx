import { usePopupContext } from '../../Contexts';
import { useNavigate } from 'react-router-dom';
import { Button } from '..';
import { icons } from '../../Assets/icons';
import { getRollNo } from '../../Utils';

export default function IntermediateBillDetailPopup() {
    const { popupInfo, setShowPopup } = usePopupContext();
    const navigate = useNavigate();

    return (
        <div className="relative w-[350px] sm:w-[450px] transition-all duration-300 bg-white rounded-xl overflow-hidden text-black p-5 flex flex-col items-center justify-center gap-3">
            <Button
                btnText={
                    <div className="size-[20px] stroke-black">
                        {icons.cross}
                    </div>
                }
                title="Close"
                onClick={() => setShowPopup(false)}
                className="absolute top-2 right-2"
            />

            <p className="text-xl font-semibold">Bill Details</p>

            <div className="bg-gray-50 p-4 mt-3 w-full rounded-lg border border-gray-100 space-y-2 shadow-sm">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {popupInfo.bill.studentInfo.fullName}
                    </h3>

                    <div className="space-x-[5px] px-3 py-[3px] text-sm font-bold rounded-full border border-blue-200 bg-blue-50 text-blue-700">
                        <span>
                            {new Date().toLocaleString('default', {
                                month: 'long',
                            })}
                        </span>
                        <span>{new Date().getFullYear()}</span>
                    </div>
                </div>

                <div className="space-y-2 text-sm">
                    <div className="space-x-2">
                        <span className="text-gray-500 font-medium">
                            Roll No:
                        </span>
                        <span className="text-gray-800">
                            {getRollNo(popupInfo.bill.studentInfo.userName)}
                        </span>
                    </div>
                    <div className="space-x-1">
                        <span className="text-gray-500 font-medium">Phone</span>
                        <span className="text-gray-800">
                            {popupInfo.bill.studentInfo.phoneNumber}
                        </span>
                    </div>
                    <div className="space-x-1">
                        <span className="text-gray-500 font-medium">Email</span>
                        <span className="text-gray-800 break-all">
                            {popupInfo.bill.studentInfo.email}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex justify-between gap-4 items-center w-full mt-3">
                <div className="flex justify-between items-center px-3 py-1 border-[0.01rem] border-blue-300 gap-2 bg-blue-50 rounded-lg">
                    <span className="font-medium text-gray-700">
                        Total Amount:
                    </span>
                    <span className="text-lg font-medium text-[#4977ec]">
                        ₹{popupInfo.bill.amount}
                    </span>
                </div>

                <Button
                    className="text-white rounded-md py-[5px] px-3 bg-[#4977ec] hover:bg-[#3b62c2] flex items-center justify-center font-medium"
                    btnText="Orders"
                    onClick={() =>
                        navigate(
                            `/orders/${popupInfo.bill.studentInfo._id}?month=${new Date().getMonth() + 1}`
                        )
                    }
                />
            </div>
        </div>
    );
}

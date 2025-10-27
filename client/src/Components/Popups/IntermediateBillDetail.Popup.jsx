import { usePopupContext } from '../../Contexts';
import { useNavigate } from 'react-router-dom';
import { Button } from '..';
import { icons } from '../../Assets/icons';
import { getRollNo } from '../../Utils';

export default function IntermediateBillDetailPopup() {
    const { popupInfo, setShowPopup } = usePopupContext();
    const navigate = useNavigate();
    const { bill } = popupInfo;

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

            <div className="bg-gray-100 p-4 mt-3 w-full rounded-lg border border-gray-200 space-y-2 shadow-sm">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-900">
                        {bill.studentInfo.fullName}
                    </h3>

                    <div className="space-x-[5px] px-3 py-[3px] text-sm font-bold rounded-full border border-blue-200 bg-blue-50 text-[#4977ec]">
                        <span>
                            {new Date().toLocaleString('default', {
                                month: 'long',
                            })}
                        </span>
                        <span>{new Date().getFullYear()}</span>
                    </div>
                </div>

                <div className="space-x-2 text-sm text-gray-800">
                    <span className="font-medium">Roll No:</span>
                    <span>{getRollNo(bill.studentInfo.userName)}</span>
                </div>

                <div className="space-x-2 text-sm text-gray-800">
                    <span className=" font-medium">Amount:</span>
                    <span>₹{bill.amount}</span>
                </div>

                <div className="space-x-2 text-sm text-gray-800">
                    <span className="font-medium">Tax:</span>
                    <span>₹{bill.tax}</span>
                </div>
            </div>

            <div className="flex justify-between gap-4 items-center w-full mt-3">
                <div className="flex justify-between items-center px-3 py-1 border-[0.01rem] border-blue-300 gap-2 bg-blue-50 rounded-md">
                    <span className="font-medium text-gray-800">
                        Grand Total:
                    </span>
                    <span className="font-medium text-[#4977ec]">
                        ₹{bill.grandTotal}
                    </span>
                </div>

                <Button
                    className="text-white rounded-md py-1 px-3 bg-[#4977ec] hover:bg-[#3b62c2] flex items-center justify-center"
                    btnText="Orders"
                    onClick={() =>
                        navigate(
                            `/orders/${bill.studentInfo._id}?month=${new Date().getMonth() + 1}`
                        )
                    }
                />
            </div>
        </div>
    );
}

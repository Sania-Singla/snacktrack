import { Button } from '..';
import { usePopupContext } from '../../Contexts';
import { icons } from '../../Assets/icons';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function ConfirmBulkStudentRegisterPopup() {
    const [loading, setLoading] = useState(false);
    const { setShowPopup, popupInfo } = usePopupContext();
    const [check, setCheck] = useState(false);
    const { excel } = popupInfo;

    const handleUpload = async (e) => {
        setLoading(true);
        try {
            const res = await contractorService.registerBulk(excel);
            if (res && !res.message) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                const name = `${user.hostelType}${user.hostelNumber}_students.zip`;
                a.download = name;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
                toast.success(`Bulk registration successful ${name}`);
            } else {
                toast.error(res.message || 'Error uploading file');
            }
        } catch (err) {
            toast.error('Something went wrong. please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative w-[350px] sm:w-[450px] transition-all duration-300 bg-white rounded-xl overflow-hidden text-black p-5 flex flex-col items-center justify-center gap-4">
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

            <div className="flex flex-col gap-4">
                <p className="text-xl font-semibold text-center">
                    Confirm Registration
                </p>
                <p className="text-sm text-center">
                    <span className="font-medium">File Choosen: </span>
                    {excel.name}
                </p>

                <div className="w-full flex flex-row-reverse gap-3 mt-2 items-start">
                    <label
                        htmlFor="confirm"
                        className="text-sm cursor-pointer text-gray-700 relative -top-1.5"
                    >
                        are you sure you want to register all students in{' '}
                        <span className="font-bold">{excel.name}</span> ?
                    </label>
                    <input
                        type="checkbox"
                        checked={check}
                        id="confirm"
                        disabled={loading}
                        className="cursor-pointer"
                        onChange={(e) => setCheck(e.target.checked)}
                    />
                </div>

                <div className="flex gap-4 items-center">
                    <Button
                        btnText="Cancel"
                        onClick={() => popupInfo.onClose()}
                        disabled={loading}
                        className="text-red-600 border text-sm border-red-300 rounded-md h-10 flex items-center justify-center w-full bg-red-50 hover:bg-red-100 transition-all duration-200 hover:shadow-md"
                    />
                    <Button
                        btnText={
                            loading ? (
                                <div className="size-5 fill-[#4977ec] dark:text-[#a2bdff]">
                                    {icons.loading}
                                </div>
                            ) : (
                                'Confirm Register'
                            )
                        }
                        onClick={handleUpload}
                        disabled={loading || !check}
                        className="text-white rounded-md border border-[#4977ec] text-sm h-10 flex items-center justify-center w-full transition-all duration-200 bg-[#4977ec] hover:bg-[#3b62c2] hover:shadow-md"
                    />
                </div>
            </div>
        </div>
    );
}

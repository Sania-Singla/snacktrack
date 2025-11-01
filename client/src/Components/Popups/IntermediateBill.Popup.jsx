import { useState } from 'react';
import { billService } from '../../Services';
import { usePopupContext, useUserContext } from '../../Contexts';
import { Button, InputField } from '..';
import { checkTokenExpired } from '../../Utils';
import { icons } from '../../Assets/icons';
import toast from 'react-hot-toast';

export default function IntermediateBillPopup() {
    const { setPopupInfo, setShowPopup } = usePopupContext();
    const [rollNo, setRollNo] = useState('');
    const [loading, setLoading] = useState(false);
    const { user, setUser } = useUserContext();

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await billService.generateIntermediateBill(rollNo);
            if (res && !res.message) {
                setPopupInfo({ type: 'intermediateBillDetail', bill: res });
            } else if (res && res.message !== 'tokens missing') {
                toast.error(res.message);
            } else checkTokenExpired(res, setUser);
        } catch (err) {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    async function generateForAll() {
        setLoading(true);
        try {
            const res = await billService.generateIntermediateBillForAll();
            if (res && !res.message) {
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                const name = `${user.hostelType}${user.hostelNumber}_bills_${new Date().toLocaleString('default', { month: 'short' })}.xlsx`;
                a.download = name;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
                toast.success('Intermediate Bills Generated Successfully');
            } else {
                toast.error('Error getting file');
            }
        } catch (err) {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="relative w-[350px] sm:w-[450px] transition-all duration-300 bg-white rounded-xl overflow-hidden text-black p-5 flex flex-col items-center justify-center">
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

            <p className="text-xl font-semibold">Intermediate Bill</p>

            <div className="space-x-[5px] px-3 py-[3px] mt-5 text-sm font-bold rounded-full border border-blue-200 bg-blue-50 text-[#4977ec]">
                <span>
                    {new Date().toLocaleString('default', { month: 'long' })}
                </span>
                <span>{new Date().getFullYear()}</span>
            </div>

            <Button
                onClick={generateForAll}
                disabled={loading}
                btnText={
                    <div className="flex gap-1.5 items-center justify-center">
                        <span className="text-[#4977ec] text-[15px] font-medium">
                            Generate for All
                        </span>
                        <div className="size-5.5 fill-[#4977ec]">
                            {icons.file}
                        </div>
                    </div>
                }
                className="border mt-8 h-10 ransition-all duration-200 hover:bg-[#4977ec]/10 active:scale-[98%] cursor-pointer text-center border-[#4977ec] rounded-md w-full"
            />

            <div className="flex gap-2 mt-4 items-center w-full">
                <hr className="text-gray-300 w-full" />
                <p className="text-gray-400 text-sm font-light pb-1">or</p>
                <hr className="text-gray-300 w-full" />
            </div>

            <form
                onSubmit={handleSubmit}
                className="flex flex-col items-start justify-center gap-2 w-full"
            >
                <InputField
                    field={{
                        type: 'text',
                        name: 'rollNo',
                        label: 'Roll No',
                        placeholder: 'Enter Roll Number',
                        required: true,
                    }}
                    handleChange={(e) => {
                        const value = e.target.value.trim();
                        setRollNo(value);
                    }}
                    className="w-full"
                    inputs={{ rollNo }}
                />

                <Button
                    type="submit"
                    className="text-white rounded-md py-2 mt-4 h-[40px] flex items-center justify-center text-lg w-full transition-all duration-200 bg-[#4977ec] hover:bg-[#3b62c2] hover:shadow-md active:scale-[98%]"
                    disabled={loading || !rollNo}
                    btnText={
                        loading ? (
                            <div className="flex items-center justify-center w-full">
                                <div className="size-5 fill-[#4977ec] dark:text-[#a2bdff]">
                                    {icons.loading}
                                </div>
                            </div>
                        ) : (
                            'Generate'
                        )
                    }
                />
            </form>
        </div>
    );
}

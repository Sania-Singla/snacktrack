import { useState } from 'react';
import { billService } from '../../Services';
import { usePopupContext } from '../../Contexts';
import { useNavigate } from 'react-router-dom';
import { Button, InputField } from '..';
import { checkTokenExpired } from '../../Utils';
import { icons } from '../../Assets/icons';

export default function IntermediateBillPopup() {
    const { setPopupInfo, setShowPopup } = usePopupContext();
    const [rollNo, setRollNo] = useState('');
    const [disabled, setDisabled] = useState(true);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setDisabled(true);
        try {
            const res = await billService.generateIntermediateBill(rollNo);
            if (res && !res.message) {
                setPopupInfo({ type: 'intermediateBillDetail', bill: res });
            } else if (res && res.message !== 'tokens missing') {
                toast.error(res.message);
            } else checkTokenExpired(res, setUser);
        } catch (err) {
            navigate('/server-error');
        } finally {
            setDisabled(false);
            setLoading(false);
        }
    }

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

            <p className="text-2xl font-bold">Generate Intermediate Bill</p>

            <div className="space-x-[5px] px-3 py-[3px] mt-3 text-sm font-bold rounded-full border border-blue-200 bg-blue-50 text-blue-700">
                <span>
                    {new Date().toLocaleString('default', { month: 'long' })}
                </span>
                <span>{new Date().getFullYear()}</span>
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
                        setDisabled(!value);
                    }}
                    className="w-full"
                    inputs={{ rollNo }}
                />

                <Button
                    type="submit"
                    className={`text-white rounded-md py-2 mt-4 h-[40px] flex items-center justify-center text-lg w-full bg-[#4977ec] hover:bg-[#3b62c2] transition-all duration-200 ${
                        disabled
                            ? 'bg-gray-400 cursor-not-allowed opacity-90 grayscale-[30%] saturate-50'
                            : 'bg-[#4977ec] hover:bg-[#3b62c2] hover:shadow-md active:scale-[98%]'
                    }`}
                    disabled={disabled}
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

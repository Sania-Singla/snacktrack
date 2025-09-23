import { useState, useEffect } from 'react';
import { orderService, userService } from '../../Services';
import { useNavigate } from 'react-router-dom';
import { Button, Dropdown } from '../../Components';
import { icons } from '../../Assets/icons';
import toast from 'react-hot-toast';
import { useUserContext } from '../../Contexts';

export default function VerifyKitchenKeyPage() {
    const navigate = useNavigate();
    const [key, setKey] = useState('');
    const { setUser } = useUserContext();
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [showKey, setShowKey] = useState(false);
    const [canteen, setCanteen] = useState({});
    const [canteens, setCanteens] = useState([
        { value: '', label: 'Select Hostel' },
    ]);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        (async function () {
            try {
                const data = await userService.getCanteens(signal);
                if (data) {
                    setCanteens((prev) => [
                        ...prev,
                        ...data.map((c) => ({
                            label: `${c.hostelType}${c.hostelNumber}-${c.hostelName}`,
                            value: c,
                        })),
                    ]);
                }
                setLoading(false);
            } catch (err) {
                navigate('/server-error');
            }
        })();

        return () => controller.abort();
    }, []);

    async function verifyKey() {
        try {
            if (!key || !canteen) return;
            setVerifying(true);
            const res = await orderService.verifyKitchenKey({
                key,
                canteenId: canteen._id,
            });
            if (res && !res.message) {
                setUser(res.user);
                navigate('/kitchen');
            } else toast.error('Please Enter a Valid Key');
            setVerifying(false);
        } catch (err) {
            navigate('/server-error');
        }
    }

    return loading ? (
        <div className="flex items-center justify-center w-full">
            <div className="size-5 fill-[#4977ec] dark:text-[#a2bdff]">
                {icons.loading}
            </div>
        </div>
    ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="sm:px-8 drop-shadow-md relative w-[350px] sm:w-[450px] bg-white rounded-xl text-black p-5 flex flex-col items-center justify-center gap-4">
                <p className="text-2xl font-semibold text-center mb-2">
                    Verify Kitchen Key
                </p>
                <p className="text-sm text-gray-600 text-center mb-3">
                    Enter the Kitchen key to access the kitchen dashboard
                </p>

                <div className="w-full flex justify-center mb-4">
                    <Dropdown options={canteens} setValue={setCanteen} />
                </div>

                <div className="relative flex items-center w-full justify-center mb-3">
                    <input
                        type={showKey ? 'text' : 'password'}
                        value={key}
                        autoFocus
                        onChange={(e) => setKey(e.target.value)}
                        className="w-full text-xl text-center border-[0.01rem] indent-3 pr-12 rounded-md py-[5px] border-gray-600 focus:border-[#4977ec] focus:outline-none"
                    />
                    <div
                        onClick={() => setShowKey((prev) => !prev)}
                        className="size-[20px] absolute right-3 top-[50%] transform translate-y-[-50%] cursor-pointer fill-gray-700"
                    >
                        {showKey ? icons.eyeOff : icons.eye}
                    </div>
                </div>

                <Button
                    btnText={
                        verifying ? (
                            <div className="flex items-center justify-center w-full">
                                <div className="size-5 fill-[#4977ec] dark:text-[#a2bdff]">
                                    {icons.loading}
                                </div>
                            </div>
                        ) : (
                            'Verify'
                        )
                    }
                    onClick={verifyKey}
                    disabled={!key}
                    className="text-white rounded-md py-2 h-[40px] flex items-center justify-center text-lg w-full bg-[#4977ec] hover:bg-[#3b62c2]"
                />
            </div>
        </div>
    );
}

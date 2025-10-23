import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Dropdown } from '../Components';
import { icons } from '../Assets/icons';
import toast from 'react-hot-toast';
import { useUserContext } from '../Contexts';
import { userService } from '../Services';

export default function VerifyKitchenKeyPage() {
    const navigate = useNavigate();
    const [key, setKey] = useState('');
    const [canteenId, setCanteenId] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [showKey, setShowKey] = useState(false);
    const [canteens, setCanteens] = useState([
        { value: '', label: 'Select Canteen' },
    ]);
    const { user, setUser } = useUserContext();

    useEffect(() => {
        if (user?.role === 'contractor') {
            navigate('/');
            return;
        }

        (async function () {
            try {
                setLoading(true);
                const res = await userService.getCanteens();
                if (res) {
                    setCanteens((prev) =>
                        prev.concat(
                            res.map((c) => ({
                                label: `${c.hostelType}${c.hostelNumber}-${c.hostelName}`,
                                value: c._id,
                            }))
                        )
                    );
                }
            } catch (err) {
                toast.error('Something went wrong. Please try again.');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    async function verifyKey(e) {
        try {
            e.preventDefault();
            if (!key || !canteenId) return;

            setVerifying(true);

            const res = await userService.verifyKitchenKey({ key, canteenId });
            if (res && !res.message) {
                setUser(res);
                navigate('/');
            } else {
                toast.error('Please Enter a Valid Key');
            }
        } catch (err) {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setVerifying(false);
        }
    }

    return (
        !loading && (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <form
                    onSubmit={verifyKey}
                    className="sm:px-8 shadow-xs border-1 border-gray-200 relative w-[350px] sm:w-[450px] bg-white rounded-xl text-black p-5 flex flex-col items-center justify-center gap-4"
                >
                    <p className="text-xl font-semibold text-center">
                        Verify Kitchen Key
                    </p>
                    <p className="text-sm text-gray-600 text-center mb-3">
                        Enter the Kitchen key to proceed
                    </p>

                    <div className="w-full flex justify-center mb-4">
                        <Dropdown options={canteens} setValue={setCanteenId} />
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
                            className="size-4 absolute right-3 top-[50%] transform translate-y-[-50%] cursor-pointer fill-gray-700"
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
                        type="submit"
                        disabled={!key || !canteenId || verifying}
                        className="text-white rounded-md h-10 flex items-center justify-center text-lg w-full bg-[#4977ec] hover:bg-[#3b62c2]"
                    />
                </form>
            </div>
        )
    );
}

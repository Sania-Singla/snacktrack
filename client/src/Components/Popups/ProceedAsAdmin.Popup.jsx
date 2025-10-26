import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../Components';
import { icons } from '../../Assets/icons';
import toast from 'react-hot-toast';
import { usePopupContext, useUserContext } from '../../Contexts';
import { adminService } from '../../Services';

export default function ProceedAsAdminPopup() {
    const navigate = useNavigate();
    const [key, setKey] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [showKey, setShowKey] = useState(false);
    const { popupInfo, setShowPopup } = usePopupContext();
    const { setUser } = useUserContext();

    async function verifyKey(e) {
        try {
            e.preventDefault();
            if (!key) return;

            setVerifying(true);
            const res = await adminService.proceedAsAdmin({
                key,
                canteenId: popupInfo.canteenId,
            });
            if (res && res.message === 'tokens missing') {
                navigate('/admin/verify-key');
            } else if (res && !res.message) {
                setUser(res);
                navigate('/');
                setShowPopup(false);
            } else {
                toast.error(res.message);
            }
        } catch (err) {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setVerifying(false);
        }
    }

    return (
        <form
            onSubmit={verifyKey}
            className="sm:px-8 shadow-xs border border-gray-200 relative w-[350px] sm:w-[450px] bg-white rounded-xl text-black p-5 flex flex-col items-center justify-center gap-4"
        >
            <p className="text-xl font-semibold text-center">
                Verify Canteen Key
            </p>
            <p className="text-sm text-gray-600 text-center mb-3">
                Enter the Canteen key to proceed
            </p>

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
                disabled={!key || verifying}
                className="text-white rounded-md h-10 flex items-center justify-center text-lg w-full bg-[#4977ec]"
            />
        </form>
    );
}

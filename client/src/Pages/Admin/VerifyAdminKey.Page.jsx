import { useState } from 'react';
import { adminService } from '../../Services';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../Components';
import { icons } from '../../Assets/icons';
import toast from 'react-hot-toast';
import { useUserContext } from '../../Contexts';

export default function VerifyAdminKeyPage() {
    const navigate = useNavigate();
    const [key, setKey] = useState('');
    const { setUser } = useUserContext();
    const [verifying, setVerifying] = useState(false);
    const [showKey, setShowKey] = useState(false);

    const verifyKey = async (e) => {
        try {
            e.preventDefault();

            if (!key) return;
            setVerifying(true);
            const res = await adminService.verifyAdminKey({ key });
            if (res && !res.message) {
                setUser(res.user);
                navigate('/admin');
            } else toast.error('Please Enter a Valid Key');
            setVerifying(false);
        } catch (err) {
            toast.error('Something went wrong. Please try again.');
        }
    };

    return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <form
                onSubmit={verifyKey}
                className="sm:px-8 drop-shadow-md relative w-[350px] sm:w-[450px] bg-white rounded-xl overflow-hidden text-black p-5 flex flex-col items-center justify-center gap-4"
            >
                <p className="text-2xl font-semibold text-center mb-2">
                    Verify Admin Key
                </p>
                <p className="text-[15px] text-gray-600 text-center mb-3">
                    Enter the Admin Secret key to navigate to control panel
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
                    type="submit"
                    disabled={!key}
                    className="text-white rounded-md py-2 h-[40px] flex items-center justify-center text-lg w-full bg-[#4977ec] hover:bg-[#3b62c2]"
                />
            </form>
        </div>
    );
}

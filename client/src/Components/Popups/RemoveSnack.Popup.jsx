import { Button, InputField } from '..';
import { usePopupContext, useSnackContext } from '../../Contexts';
import { icons } from '../../Assets/icons';
import { useNavigate } from 'react-router-dom';
import { contractorService } from '../../Services';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function RemoveSnackPopup() {
    const [loading, setLoading] = useState(false);
    const { setShowPopup, popupInfo } = usePopupContext();
    const { setSnacks } = useSnackContext();
    const navigate = useNavigate();
    const [check, setCheck] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    async function removeSnack() {
        setLoading(true);
        setDisabled(true);
        try {
            const res = await contractorService.removeSnack(
                popupInfo.target._id,
                password
            );
            if (res && res.message === 'snack deleted successfully') {
                setSnacks((prev) =>
                    prev.filter((snack) => snack._id !== popupInfo.target._id)
                );
                toast.success('Snack Deleted Successfully 😕');
            } else toast.error(res?.message);
        } catch (err) {
            navigate('/server-error');
        } finally {
            setDisabled(false);
            setLoading(false);
            setShowPopup(false);
        }
    }

    function onMouseOver() {
        if (!check || !password) setDisabled(true);
        else setDisabled(false);
    }

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

            <div className="flex flex-col gap-3">
                <p className="text-2xl font-bold text-center">Remove Snack</p>
                <p className="text-[15px] text-center">
                    <span className="font-medium">Name: </span>
                    {popupInfo.target.name}
                </p>

                <div className="w-full flex flex-row-reverse gap-3 mt-2 items-start">
                    <label
                        htmlFor="delete snack"
                        className="text-sm cursor-pointer text-gray-700 relative -top-2"
                    >
                        are you sure you want to remove this snack ? although
                        you can add it again in the future.
                    </label>
                    <input
                        type="checkbox"
                        checked={check}
                        id="delete snack"
                        className="cursor-pointer"
                        onChange={(e) => setCheck(e.target.checked)}
                    />
                </div>

                <div className="w-full relative -top-4">
                    <InputField
                        field={{
                            type: showPassword ? 'text' : 'password',
                            name: 'password',
                            label: 'Password',
                            required: true,
                            placeholder: 'Enter password to confirm delete',
                        }}
                        inputs={{ password }}
                        setShowPassword={setShowPassword}
                        showPassword={showPassword}
                        handleChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <Button
                    btnText={
                        loading ? (
                            <div className="flex items-center justify-center w-full">
                                <div className="size-5 fill-red-700 dark:text-[#e95555]">
                                    {icons.loading}
                                </div>
                            </div>
                        ) : (
                            'Delete'
                        )
                    }
                    onClick={removeSnack}
                    onMouseOver={onMouseOver}
                    disabled={disabled}
                    className="text-white relative -top-2 rounded-md w-full py-2 px-3 bg-red-700 hover:bg-red-800"
                />
            </div>
        </div>
    );
}

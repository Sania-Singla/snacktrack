import { Button, InputField } from '..';
import {
    usePopupContext,
    useStudentContext,
    useUserContext,
} from '../../Contexts';
import { icons } from '../../Assets/icons';
import { useNavigate } from 'react-router-dom';
import { contractorService } from '../../Services';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { checkTokenExpired } from '../../Utils';

export default function RemoveAllStudentsPopup() {
    const [loading, setLoading] = useState(false);
    const { setShowPopup } = usePopupContext();
    const { setStudents } = useStudentContext();
    const navigate = useNavigate();
    const { user, setUser } = useUserContext();
    const [check, setCheck] = useState(false);
    const [disabled, setDisabled] = useState(true);
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    function handleDisable() {
        if (!check || !password) return true;
        else return false;
    }

    function onMouseOver() {
        setDisabled(handleDisable());
    }

    async function removeStudents() {
        if (handleDisable()) {
            toast.error('Please fill all fields correctly');
            return;
        }
        setLoading(true);
        setDisabled(true);
        try {
            const res = await contractorService.removeAllStudents(password);
            if (res && res.message === 'all students removed successfully') {
                setStudents([]);
                toast.success('All students removed successfully');
            } else if (res && res.message !== 'tokens missing') {
                toast.error(res?.message);
            } else checkTokenExpired(res, setUser);
        } catch (err) {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setDisabled(false);
            setLoading(false);
            setShowPopup(false);
        }
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
                <p className="text-2xl font-semibold text-center">
                    Remove All Students
                </p>
                <p className="text-[15px] text-center font-medium">
                    {user.hostelType}
                    {user.hostelNumber} - {user.hostelName}
                </p>

                <div className="w-full flex flex-row-reverse gap-3 mt-2 items-start">
                    <label
                        htmlFor="delete student"
                        className="text-sm cursor-pointer text-gray-700 relative -top-2"
                    >
                        are you sure you want to remove all student accounts ?
                        although you can register them again in the future.
                    </label>
                    <input
                        type="checkbox"
                        checked={check}
                        id="delete student"
                        className="cursor-pointer"
                        onChange={(e) => {
                            setCheck(e.target.checked);
                            setDisabled(!e.target.checked || !password);
                        }}
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
                        handleChange={(e) => {
                            setPassword(e.target.value);
                            setDisabled(!e.target.value || !check);
                        }}
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
                    onClick={removeStudents}
                    onMouseOver={onMouseOver}
                    disabled={disabled}
                    className="text-white relative -top-2 rounded-md py-2 px-3 flex items-center justify-center w-full transition-all duration-200 bg-red-700 hover:bg-red-800 hover:shadow-md active:scale-[98%]"
                />
            </div>
        </div>
    );
}

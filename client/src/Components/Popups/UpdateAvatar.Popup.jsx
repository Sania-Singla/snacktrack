import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePopupContext, useUserContext } from '../../Contexts';
import { fileRestrictions } from '../../Utils';
import { userService } from '../../Services';
import { icons } from '../../Assets/icons';
import {
    MAX_FILE_SIZE,
    USER_PLACEHOLDER_IMAGE,
} from '../../Constants/constants';
import { Button } from '..';
import toast from 'react-hot-toast';

export default function UpdateAvatarPopup() {
    const { user, setUser } = useUserContext();
    const { setShowPopup } = usePopupContext();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(user.avatar);
    const [avatar, setAvatar] = useState(null);
    const [disabled, setDisabled] = useState(false);
    const navigate = useNavigate();
    const ref = useRef();

    async function handleChange(e) {
        const { files } = e.target;
        if (files[0]) {
            const file = files[0];
            setAvatar(file);
            setAvatarPreview(URL.createObjectURL(file));

            if (!fileRestrictions(file)) {
                setAvatarPreview(USER_PLACEHOLDER_IMAGE);
                setError(
                    `only PNG, JPG/JPEG files are allowed and File size should not exceed ${MAX_FILE_SIZE} MB`
                );
            } else {
                setAvatarPreview(URL.createObjectURL(file));
                setError('');
            }
        }
    }

    function onMouseOver() {
        if (error || !avatar) setDisabled(true);
        else setDisabled(false);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);
        setDisabled(true);
        try {
            const res = await userService.updateAvatar(avatar);
            if (res && !res.message) {
                setUser({ ...user, avatar: res.newAvatar });
                toast.success('Avatar updated successfully');
            }
        } catch (err) {
            navigate('/server-error');
        } finally {
            setLoading(false);
            setDisabled(false);
            setShowPopup(false);
        }
    }

    return (
        <div className="w-[300px] drop-shadow-md bg-white p-5 rounded-xl">
            <div className="w-full text-center text-2xl font-semibold mb-4 text-black">
                Update Avatar
            </div>

            {/* preview */}
            <div className="w-full flex items-center justify-center">
                <div
                    className="cursor-pointer rounded-full size-fit overflow-hidden"
                    onClick={() => ref.current.click()}
                >
                    <img
                        src={avatarPreview}
                        alt="preview"
                        className={`hover:brightness-75 size-[150px] rounded-full border-[0.2rem] object-cover ${
                            error ? 'border-red-500' : 'border-green-500'
                        }`}
                    />
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <input
                    type="file"
                    name="avatar"
                    id="avatar"
                    className="hidden"
                    onChange={handleChange}
                    ref={ref}
                />

                {error && (
                    <div className="text-sm mt-4 px-2 text-red-500 w-full text-center">
                        {error}
                    </div>
                )}

                {/* upload btn */}
                <div className="w-full mt-4 flex items-center justify-center">
                    <Button
                        btnText={
                            loading ? (
                                <div className="flex items-center justify-center w-full">
                                    <div className="size-5 text-center fill-[#4977ec] dark:text-[#a2bdff]">
                                        {icons.loading}
                                    </div>
                                </div>
                            ) : (
                                'Upload'
                            )
                        }
                        disabled={disabled}
                        onMouseOver={onMouseOver}
                        type="submit"
                        className="text-white rounded-md py-2 text-lg w-full bg-[#4977ec] hover:bg-[#3b62c2]"
                    />
                </div>
            </form>

            {/* cross */}
            <Button
                title="Close"
                btnText={
                    <div className="size-[22px] fill-none stroke-black">
                        {icons.cross}
                    </div>
                }
                onClick={() => setShowPopup(false)}
                className="absolute top-[5px] right-[5px] bg-transparent"
            />
        </div>
    );
}

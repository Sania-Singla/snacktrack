import { Outlet, NavLink } from 'react-router-dom';
import { Button } from '../Components';
import { usePopupContext, useUserContext } from '../Contexts';
import { icons } from '../Assets/icons';
import { getRollNo } from '../Utils';

export default function SettingsPage() {
    const { user } = useUserContext();
    const { setShowPopup, setPopupInfo } = usePopupContext();

    const tabOptions = [
        { name: 'Personal Information', path: '', show: true },
        { name: 'Update Password', path: 'password', show: true },
    ];

    const tabElements = tabOptions.map(
        (option) =>
            option.show && (
                <NavLink
                    end
                    key={option.name}
                    to={option.path}
                    className={({ isActive }) =>
                        `${isActive ? 'bg-[#4977ec] text-white' : 'bg-white text-black'} text-ellipsis shadow-sm hover:backdrop-brightness-90 rounded-md p-2 w-full text-center`
                    }
                >
                    <div>{option.name}</div>
                </NavLink>
            )
    );

    return (
        <div className="w-full h-full overflow-scroll py-3 px-1 sm:px-3">
            <div className="flex gap-4 items-center justify-start mb-7">
                {/* avatar */}
                <div className="relative">
                    <div className="rounded-full drop-shadow-sm size-24">
                        <img
                            alt="user avatar"
                            src={user.avatar}
                            className="h-24 w-24 object-cover rounded-full border-1 border-gray-400"
                        />
                    </div>

                    <div>
                        <Button
                            btnText={
                                <div className="size-[25px] fill-[#202020]">
                                    {icons.upload}
                                </div>
                            }
                            onClick={() => {
                                setShowPopup(true);
                                setPopupInfo({ type: 'updateAvatar' });
                            }}
                            className="drop-shadow-sm hover:brightness-95 absolute top-[50%] translate-y-[-50%] left-[50%] translate-x-[-50%] rounded-md p-1 bg-[#f9f9f9] border-[0.01rem] border-[#4977ec]"
                        />
                    </div>
                </div>

                {/* info*/}
                <div className="space-y-1">
                    <p className="text-xl font-semibold">{user.fullName}</p>
                    <p>
                        @{user.hostelType}
                        {user.hostelNumber} - {user.hostelName}
                    </p>
                    {user.role === 'student' && (
                        <p>Roll No: {getRollNo(user.userName)}</p>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-evenly w-full gap-4 md:px-4">
                {tabElements}
            </div>

            <div className="border-t-1 py-4 border-gray-300 md:px-4 mt-6">
                <Outlet />
            </div>
        </div>
    );
}

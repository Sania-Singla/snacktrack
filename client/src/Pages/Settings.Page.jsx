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
        {
            name: 'Update Kitchen Key',
            path: 'kitchen-key',
            show: user.role === 'contractor',
        },
    ];

    const tabElements = tabOptions.map(
        (option) =>
            option.show && (
                <NavLink
                    end
                    key={option.name}
                    to={option.path}
                    className={({ isActive }) =>
                        `${isActive ? 'border-b-[#4977ec] bg-[#4977ec] text-white' : 'border-b-black bg-white text-black'} text-ellipsis drop-shadow-sm hover:backdrop-brightness-90 rounded-t-md p-2 border-b-[0.1rem] w-full text-center md:text-lg font-medium`
                    }
                >
                    <div>{option.name}</div>
                </NavLink>
            )
    );

    return (
        <div className="w-full h-full overflow-scroll py-4 space-y-8">
            <div className="w-full px-2 md:px-4">
                {/* avatar */}
                <div className="flex gap-4 items-center justify-start">
                    <div className="relative">
                        <div className="rounded-full overflow-hidden size-24 border">
                            <img
                                alt="user avatar"
                                src={user.avatar}
                                className="size-full object-cover drop-shadow-md"
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
                                className="drop-shadow-md hover:brightness-95 absolute top-[50%] translate-y-[-50%] left-[50%] translate-x-[-50%] rounded-md p-1 bg-[#f9f9f9] border-[0.01rem] border-[#4977ec]"
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
                        <p>Roll No: {getRollNo(user.userName)}</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-evenly w-full gap-4 md:px-4">
                {tabElements}
            </div>

            <div className="border-t py-4 border-gray-400 md:px-4">
                <Outlet />
            </div>
        </div>
    );
}

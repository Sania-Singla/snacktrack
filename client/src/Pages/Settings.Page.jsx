import { Outlet, NavLink } from 'react-router-dom';
import { useUserContext } from '../Contexts';
import { getRollNo } from '../Utils';

export default function SettingsPage() {
    const { user } = useUserContext();

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
                        `${isActive ? 'bg-[#4977ec] text-white' : 'bg-white text-black'} text-ellipsis shadow-sm hover:backdrop-brightness-90 rounded-md p-1.5 md:p-2 w-full text-center`
                    }
                >
                    <div>{option.name}</div>
                </NavLink>
            )
    );

    return (
        <div className="w-full h-full overflow-hidden px-1 py-2 sm:px-3">
            <div className="flex gap-4 items-center justify-start mb-7">
                {/* avatar */}
                <div className="relative">
                    <div
                        onClick={() => navigate('/settings')}
                        className="size-15 text-2xl bg-[#e96805] text-white rounded-full flex items-center justify-center cursor-pointer hover:brightness-90 overflow-hidden shadow-sm"
                    >
                        <div>{user.fullName.slice(0, 1).toUpperCase()}</div>
                    </div>
                </div>

                {/* info*/}
                <div className="pb-1 text-gray-800 w-full">
                    <div className="flex justify-between gap-4 w-full items-center">
                        <p className="text-xl font-semibold">{user.fullName}</p>

                        <p className="text-sm font-medium w-fit text-center text-gray-700 bg-white border-1 border-gray-200 px-2 py-1 rounded-md">
                            <span className="font-semibold text-[#4977ec]">
                                {user.hostelType}
                                {user.hostelNumber}
                            </span>{' '}
                            - {user.hostelName}
                        </p>
                    </div>

                    {user.role === 'student' ? (
                        <p>
                            <span className="font-medium">Roll No:</span>{' '}
                            {getRollNo(user.userName)}
                        </p>
                    ) : (
                        <p className="text-gray-600">Management</p>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-evenly w-full gap-4 md:px-4">
                {tabElements}
            </div>

            <div className="border-t-1 py-4 border-gray-300 md:px-2 mt-6">
                <Outlet />
            </div>
        </div>
    );
}

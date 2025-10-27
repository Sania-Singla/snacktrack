import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Logout, Searchbar, Cart } from '..';
import {
    useUserContext,
    useSideBarContext,
    useSocketContext,
} from '../../Contexts';
import { LOGO_SVG, SOCKET_EVENTS } from '../../Constants';
import { icons } from '../../Assets/icons';
import { contractorService } from '../../Services';
import { useEffect } from 'react';

export default function Header() {
    const { user, setUser } = useUserContext();
    const { pathname } = useLocation();
    const { setShowSideBar } = useSideBarContext();
    const navigate = useNavigate();``
    const { socket } = useSocketContext();

    useEffect(() => {
        if (!socket) return;

        socket.on(
            SOCKET_EVENTS.CANTEEN_OPEN_STATUS_CHANGED,
            ({ isOpen, canteenId }) => {
                if (user.canteenId !== canteenId) return;
                setUser((prevUser) => ({ ...prevUser, isOpen }));
            }
        );

        return () => {
            socket.off(SOCKET_EVENTS.CANTEEN_OPEN_STATUS_CHANGED);
        };
    }, [socket]);

    const staticPages = ['/settings', '/statistics', '/cart'];

    const isStaticPage = staticPages.some((page) => pathname.startsWith(page));

    return (
        <header className="border-b border-b-gray-200 fixed top-0 z-[10] w-full bg-gray-50 text-black h-[60px] sm:px-5 px-3 font-medium flex items-center justify-between gap-4">
            <div className="flex items-center justify-center gap-3">
                {/* hamburgur menu btn */}
                <Button
                    btnText={
                        <div className="size-5.5 fill-[#434343] hover:fill-[#4977ec]">
                            {icons.hamburgur}
                        </div>
                    }
                    title="Show Sidebar"
                    onClick={() => setShowSideBar((prev) => !prev)}
                />

                {/* logo */}
                <Link
                    to={'/'}
                    className="flex items-center justify-center gap-1 text-nowrap font-medium text-lg"
                >
                    <div className="size-10">
                        <img
                            src={LOGO_SVG}
                            alt="Snack Track Logo"
                            className="object-cover size-full"
                        />
                    </div>
                    <p className="hover:text-[#4977ec]">SnackTrack</p>
                </Link>
            </div>

            <div
                className={`${isStaticPage ? 'hidden' : 'hidden sm:block'} max-w-[400px] lg:max-w-[500px] mx-2 w-full`}
            >
                <Searchbar />
            </div>

            <div className="flex gap-3 items-center">
                <div className="flex gap-3 items-center">
                    {user.role === 'contractor' ? (
                        <Button
                            onClick={async () => {
                                const res =
                                    await contractorService.changeCanteenStatus(
                                        !user.isOpen
                                    );
                                if (res) {
                                    setUser((prev) => ({
                                        ...prev,
                                        isOpen: !prev.isOpen,
                                    }));
                                }
                            }}
                            btnText={
                                <div className="flex items-center justify-center gap-1.5">
                                    {user.isOpen
                                        ? 'Close Canteen'
                                        : 'Open Canteen'}
                                </div>
                            }
                            title={
                                user.isOpen ? 'Close Canteen' : 'Open Canteen'
                            }
                            className={`text-white rounded-md w-fit text-nowrap px-2 h-7 text-sm font-normal ${user.isOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                        />
                    ) : (
                        <p
                            className={`rounded-md w-fit text-nowrap px-2 py-1 text-sm font-medium ${user.isOpen ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}
                        >
                            {user.isOpen ? 'Open' : 'Closed'}
                        </p>
                    )}

                    {user.role === 'admin' && (
                        <Button
                            onClick={() => navigate('/register-student')}
                            btnText={
                                <div className="flex items-center justify-center gap-1.5">
                                    <div className="size-3 fill-white">
                                        {icons.plus}
                                    </div>
                                    <span>Student</span>
                                </div>
                            }
                            title="Add Student"
                            className="text-white rounded-md w-fit text-nowrap px-2 h-7 text-sm font-normal bg-[#4977ec] hover:bg-[#3b62c2]"
                        />
                    )}
                </div>

                {user.role === 'student' && <Cart />}

                <div>
                    {user.role === 'student' ? (
                        <div
                            onClick={() => navigate('/settings')}
                            className="size-8 bg-[#e96805] text-white rounded-full flex items-center justify-center cursor-pointer hover:brightness-90 overflow-hidden shadow-xs"
                        >
                            <div>{user.fullName.slice(0, 1).toUpperCase()}</div>
                        </div>
                    ) : (
                        <div className="font-semibold text-[#4977ec] rounded-md bg-white border-1 border-gray-200 px-2 py-0.5">
                            {user.hostelType}
                            {user.hostelNumber}
                        </div>
                    )}
                </div>
                {user.role === 'student' && (
                    <div className="hidden md:block">
                        <Logout />
                    </div>
                )}
            </div>
        </header>
    );
}

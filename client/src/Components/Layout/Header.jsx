import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Logout, Searchbar, Cart } from '..';
import { useUserContext, useSideBarContext } from '../../Contexts';
import { LOGO_SVG } from '../../Constants';
import { icons } from '../../Assets/icons';

export default function Header() {
    const { user } = useUserContext();
    const { pathname } = useLocation();
    const { setShowSideBar } = useSideBarContext();
    const navigate = useNavigate();

    const staticPages = ['/settings', '/statistics', '/cart'];

    const isStaticPage = staticPages.some((page) => pathname.startsWith(page));

    return (
        <header className="border-b border-b-gray-200 fixed top-0 z-[10] w-full bg-gray-50 text-black h-[60px] sm:px-5 px-3 font-medium flex items-center justify-between gap-4">
            <div className="flex items-center justify-center gap-4">
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
                className={`${isStaticPage ? 'hidden' : 'hidden sm:block'} max-w-[400px] lg:max-w-[500px] mx-4 w-full`}
            >
                <Searchbar />
            </div>

            <div className="flex gap-3.5 items-center">
                {user.role === 'student' ? (
                    <Cart />
                ) : (
                    <div>
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
                    </div>
                )}

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

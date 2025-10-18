import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Logout, Searchbar } from '..';
import {
    useUserContext,
    useSideBarContext,
    useStudentContext,
} from '../../Contexts';
import { LOGO_SVG } from '../../Constants/constants';
import { icons } from '../../Assets/icons';

export default function Header() {
    const { user } = useUserContext();
    const { pathname } = useLocation();
    const { setShowSideBar } = useSideBarContext();
    const navigate = useNavigate();
    const { cartItems } = useStudentContext();

    // total quantity by adding all item quantities
    const totalQuantity = cartItems.reduce(
        (total, item) => total + item.quantity,
        0
    );

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
                    <div className="relative">
                        <Button
                            btnText={
                                <div className="size-4 group-hover:fill-[#4977ec] fill-[#434343]">
                                    {icons.cart}
                                </div>
                            }
                            title="View Cart"
                            onClick={() => navigate('/cart')}
                            className="bg-[#ffffff] p-2 group rounded-full shadow-sm w-fit"
                        />
                        {/* total quantity count */}
                        {totalQuantity > 0 && (
                            <span className="text-xs flex items-center justify-center leading-3 text-white absolute -top-1 -right-1 size-4 bg-red-600 rounded-full">
                                {totalQuantity}
                            </span>
                        )}
                    </div>
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
                            className="text-white rounded-md w-fit text-nowrap font-normal px-2 h-7.5 bg-[#4977ec] hover:bg-[#3b62c2]"
                        />
                    </div>
                )}

                <div
                    onClick={() => navigate('/settings')}
                    className="size-8 bg-[#e96805] text-white rounded-full flex items-center justify-center cursor-pointer hover:brightness-90 overflow-hidden shadow-sm"
                >
                    <div>{user.fullName.slice(0, 1).toUpperCase()}</div>
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

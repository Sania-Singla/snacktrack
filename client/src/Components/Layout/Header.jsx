import { Link, useNavigate } from 'react-router-dom';
import { Button, Logout, Searchbar } from '..';
import {
    useUserContext,
    useSideBarContext,
    useStudentContext,
} from '../../Contexts';
import { LOGO } from '../../Constants/constants';
import { icons } from '../../Assets/icons';

export default function Header() {
    const { user } = useUserContext();
    const { setShowSideBar } = useSideBarContext();
    const navigate = useNavigate();
    const { cartItems } = useStudentContext();

    // Calculate total quantity by summing all item quantities
    const totalQuantity = cartItems.reduce(
        (total, item) => total + item.quantity,
        0
    );

    return (
        <header className="drop-shadow-sm fixed top-0 z-[10] w-full bg-[#f9f9f9] text-black h-[60px] px-4 font-medium flex items-center justify-between gap-4">
            <div className="flex items-center justify-center gap-4">
                {/* hamburgur menu btn */}
                <Button
                    btnText={
                        <div className="size-[20px] fill-[#434343] group-hover:fill-[#4977ec]">
                            {icons.hamburgur}
                        </div>
                    }
                    title="Show Sidebar"
                    onClick={() => setShowSideBar((prev) => !prev)}
                    className="bg-[#ffffff] p-[9px] group rounded-full drop-shadow-sm w-fit"
                />

                {/* logo */}
                <Link
                    to={'/'}
                    className="flex items-center justify-center gap-3 text-nowrap font-medium text-xl"
                >
                    <div className="overflow-hidden rounded-full size-[38px] drop-shadow-sm hover:scale-110 transition-all duration-300">
                        <img
                            src={LOGO}
                            alt="Snack Track Logo"
                            className="object-cover size-full hover:brightness-95"
                        />
                    </div>
                    <p className="hover:scale-110 transition-all duration-300">
                        SnackTrack
                    </p>
                </Link>
            </div>

            <Searchbar />

            <div className="flex gap-4 items-center">
                {user.role === 'student' ? (
                    <div className="relative">
                        <Button
                            btnText={
                                <div className="size-[20px] group-hover:fill-[#4977ec] fill-[#434343]">
                                    {icons.cart}
                                </div>
                            }
                            title="View Cart"
                            onClick={() => navigate('/cart')}
                            className="bg-[#ffffff] p-[9px] group rounded-full drop-shadow-sm w-fit"
                        />
                        {/* total quantity count */}
                        {totalQuantity > 0 && (
                            <span className="text-[13px] flex items-center justify-center leading-3 text-white absolute -top-1 -right-1 size-5 bg-red-600 rounded-full">
                                {totalQuantity}
                            </span>
                        )}
                    </div>
                ) : (
                    <div>
                        <Button
                            onClick={() => navigate('/register-student')}
                            btnText={
                                <div className="flex items-center justify-center gap-2">
                                    <div className="size-[16px] fill-white">
                                        {icons.memberAdd}
                                    </div>
                                    <span>Student</span>
                                </div>
                            }
                            title="Add Student"
                            className="text-white rounded-md w-fit text-nowrap px-3 h-[35px] bg-[#4977ec] hover:bg-[#3b62c2]"
                        />
                    </div>
                )}
                <div
                    className={`hidden ${user.role === 'student' ? 'sm:block' : 'md:block'}`}
                >
                    <Logout />
                </div>
            </div>
        </header>
    );
}

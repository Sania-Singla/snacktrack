import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    useSideBarContext,
    useUserContext,
    usePopupContext,
    useSocketContext,
} from './Contexts';
import { userService } from './Services';
import { icons } from './Assets/icons';

export default function App() {
    const [loading, setLoading] = useState(true);
    const { setUser, user } = useUserContext();
    const { setShowSideBar } = useSideBarContext();
    const { setShowPopup } = usePopupContext();
    const navigate = useNavigate();
    const location = useLocation();
    const { socket } = useSocketContext();

    useEffect(() => {
        (async function currentUser() {
            try {
                const res = await userService.getCurrentUser();
                if (res && !res.message) setUser(res);
                else setUser(null);
            } catch (err) {
                navigate('/server-error');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Close sidebar & popups on window resize and location change
    useEffect(() => {
        const closeSidebar = () => setShowSideBar(false);
        const closePopup = () => setShowPopup(false);
        window.addEventListener('resize', closeSidebar);
        closeSidebar();
        closePopup();
    }, [location]);

    return (
        <div className="bg-white h-[100vh] w-[100vw]">
            {loading || (user && !socket) ? (
                <div className="text-black h-full w-full flex flex-col items-center justify-center">
                    <div className="size-6 fill-[#4977ec] dark:text-[#ececec]">
                        {icons.loading}
                    </div>
                    <p className="mt-3 text-xl font-semibold">Please Wait...</p>
                    <p className="text-sm mt-2 text-gray-600">
                        Due to free hosting, it might take long.
                    </p>
                </div>
            ) : (
                <Outlet />
            )}
        </div>
    );
}

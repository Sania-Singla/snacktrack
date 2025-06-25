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
                    <div className="size-[33px] fill-[#4977ec] dark:text-[#ececec]">
                        {icons.loading}
                    </div>
                    <p className="mt-2 text-2xl font-semibold">
                        Please Wait...
                    </p>
                    <p className="text-[16px] mt-1">
                        Please refresh the page, if it takes too long
                    </p>
                </div>
            ) : (
                <Outlet />
            )}
        </div>
    );
}

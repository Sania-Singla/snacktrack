import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
    useSideBarContext,
    useUserContext,
    usePopupContext,
    useSocketContext,
} from './Contexts';
import { userService } from './Services';
import { LOGO } from './Constants';
import toast from 'react-hot-toast';

export default function App() {
    const [loading, setLoading] = useState(true);
    const { setUser, user } = useUserContext();
    const { setShowSideBar } = useSideBarContext();
    const { setShowPopup } = usePopupContext();
    const location = useLocation();
    const { socket } = useSocketContext();

    useEffect(() => {
        (async function currentUser() {
            try {
                const res = await userService.getCurrentUser();
                if (res && !res.message) setUser(res);
                else setUser(null);
            } catch (err) {
                toast.error('Something went wrong. Please try again.');
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
            {loading || (user && user.role !== 'admin' && !socket) ? (
                <div className="text-black h-full w-full flex flex-col items-center justify-center">
                    <img src={LOGO} alt="snacktrack logo" className="size-20" />
                </div>
            ) : (
                <Outlet />
            )}
        </div>
    );
}

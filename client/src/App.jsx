import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSideBarContext, useUserContext, usePopupContext } from './Contexts';
import { userService } from './Services';
import { icons } from './Assets/icons';

export default function App() {
    const [loading, setLoading] = useState(true);
    const { setUser } = useUserContext();
    const { setShowSideBar } = useSideBarContext();
    const { setShowPopup } = usePopupContext();
    const navigate = useNavigate();
    const location = useLocation();

    // get current user
    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        (async function currentUser() {
            try {
                setLoading(true);
                const user = await userService.getCurrentUser(signal);
                setUser(user && !user.message ? user : null);
            } catch (err) {
                navigate('/server-error');
            } finally {
                setLoading(false);
            }
        })();

        return () => {
            controller.abort();
            setUser(null);
        };
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
        <div className="bg-white h-screen w-screen">
            {loading ? (
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

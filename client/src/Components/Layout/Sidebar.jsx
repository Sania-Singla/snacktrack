import { NavLink } from 'react-router-dom';
import { useSideBarContext, useUserContext } from '../../Contexts';
import { icons } from '../../Assets/icons';
import { Button, Logout } from '..';
import { AnimatePresence, motion } from 'framer-motion';
import { useRef } from 'react';

export default function Sidebar() {
    const { user } = useUserContext();
    const { showSideBar, setShowSideBar } = useSideBarContext();
    const items = [
        { path: '/', name: 'Home', icon: icons.home, show: true },
        {
            path: `/orders/${user._id}`,
            name: 'My Orders',
            icon: icons.clock,
            show: user.role === 'student',
        },
        {
            path: `/bills/${user._id}`,
            name: 'My Bills',
            icon: icons.rupee,
            show: user.role === 'student',
        },
        {
            path: '/today-orders',
            name: 'Today Orders',
            icon: icons.store,
            show: user.role === 'contractor',
        },
        {
            path: '/all-bills',
            name: 'Bills',
            icon: icons.rupee,
            show: user.role === 'contractor' || user.role === 'admin',
        },
        {
            path: '/history',
            name: 'History',
            icon: icons.clock,
            show: user.role === 'contractor' || user.role === 'admin',
        },
        {
            path: '/students',
            name: 'Students',
            icon: icons.group,
            show: user.role === 'contractor' || user.role === 'admin',
        },
        {
            path: '/settings',
            name: 'Settings',
            icon: icons.settings,
            show: user.role === 'student' || user.role === 'admin',
        },
    ];

    const itemElements = items.map(
        (item) =>
            item.show && (
                <NavLink
                    key={item.name}
                    className={({ isActive }) =>
                        `${isActive && 'backdrop-brightness-95'} w-full py-2 px-[10px] rounded-md hover:backdrop-brightness-95`
                    }
                    to={item.path}
                >
                    <div className="flex items-center justify-start gap-4">
                        <div className="size-[18px] fill-gray-700">
                            {item.icon}
                        </div>
                        <div>{item.name}</div>
                    </div>
                </NavLink>
            )
    );

    const sideBarRef = useRef();

    function closeSideBar(e) {
        if (e.target === sideBarRef.current) {
            setShowSideBar(false);
        }
    }

    const sideBarVariants = {
        beginning: {
            x: '-100vw',
        },
        end: {
            x: 0,
            transition: {
                type: 'tween',
                duration: 0.2,
            },
        },
        exit: {
            x: '-100vw',
            transition: {
                type: 'tween',
                duration: 0.2,
            },
        },
    };

    const backdropVariants = {
        visible: {
            backdropFilter: 'brightness(0.65)',
            transition: {
                duration: 0.3,
            },
        },
        hidden: {
            backdropFilter: 'brightness(1)',
            transition: {
                duration: 0.1,
            },
        },
    };

    return (
        <AnimatePresence>
            {showSideBar && (
                <motion.div
                    ref={sideBarRef}
                    onClick={closeSideBar}
                    className="fixed inset-0 z-[100] h-screen"
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                >
                    <motion.aside
                        variants={sideBarVariants}
                        initial="beginning"
                        animate="end"
                        exit="exit"
                        className="h-full w-[265px] flex justify-start"
                    >
                        <div className="w-full bg-gray-50 drop-shadow-sm flex flex-col items-start justify-start h-full">
                            <div className="h-[60px] sm:px-5 px-3 gap-5 w-full flex items-center justify-between">
                                <Button
                                    btnText={
                                        <div className="size-5.5 fill-[#434343] hover:fill-[#4977ec]">
                                            {icons.hamburgur}
                                        </div>
                                    }
                                    onClick={() =>
                                        setShowSideBar((prev) => !prev)
                                    }
                                    title="Close Sidebar"
                                />

                                <Logout />
                            </div>

                            <hr className="w-full border-gray-200" />

                            <div className="text-[17px] px-2 py-3 h-[calc(100%-60px)] text-black overflow-y-auto w-full flex flex-col gap-1 mb-1 items-start justify-start">
                                {itemElements}
                            </div>
                        </div>
                    </motion.aside>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

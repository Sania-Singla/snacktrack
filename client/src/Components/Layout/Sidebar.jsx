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
            name: "Today's Orders",
            icon: icons.clock,
            show: user.role === 'contractor',
        },
        {
            path: '/all-bills',
            name: 'Bills',
            icon: icons.rupee,
            show: user.role === 'contractor',
        },
        {
            path: '/kitchen',
            name: 'Kitchen',
            icon: icons.store,
            show: user.role === 'contractor',
        },
        {
            path: '/students',
            name: 'Students',
            icon: icons.group,
            show: user.role === 'contractor',
        },
        {
            path: '/settings',
            name: 'Settings',
            icon: icons.settings,
            show: true,
        },
    ];

    const itemElements = items.map(
        (item) =>
            item.show && (
                <NavLink
                    key={item.name}
                    className={({ isActive }) =>
                        `${isActive && 'backdrop-brightness-90'} w-full py-2 px-[10px] rounded-md hover:backdrop-brightness-90`
                    }
                    to={item.path}
                >
                    <div className="flex items-center justify-start gap-4">
                        <div className="size-[19px] fill-[#2a2a2a]">
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
                duration: 0.5,
            },
        },
        exit: {
            x: '-100vw',
            transition: {
                type: 'tween',
                duration: 1,
            },
        },
    };

    const backdropVariants = {
        visible: {
            backdropFilter: 'brightness(0.65)',
            transition: {
                duration: 0.5,
            },
        },
        hidden: {
            backdropFilter: 'brightness(1)',
            transition: {
                duration: 0.2,
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
                        <div className="w-full px-3 bg-[#f9f9f9] drop-shadow-sm flex flex-col items-start justify-start h-full">
                            <div className="h-[60px] gap-5 px-1 w-full flex items-center justify-between">
                                {/* hamburgur menu btn */}
                                <Button
                                    btnText={
                                        <div className="size-[20px] fill-[#434343] group-hover:fill-[#4977ec]">
                                            {icons.hamburgur}
                                        </div>
                                    }
                                    onClick={() =>
                                        setShowSideBar((prev) => !prev)
                                    }
                                    title="Close Sidebar"
                                    className="bg-[#ffffff] p-[10px] group rounded-full drop-shadow-sm w-fit"
                                />

                                <div className="flex gap-4 items-center">
                                    <div
                                        className={`block ${user.role === 'student' ? 'sm:hidden' : 'md:hidden'}`}
                                    >
                                        <Logout />
                                    </div>
                                    {/* avatar */}
                                    <div className="size-[40px] rounded-full overflow-hidden drop-shadow-sm hover:brightness-90">
                                        <img
                                            src={user.avatar}
                                            alt="user avatar"
                                            className="size-full object-cover"
                                        />
                                    </div>
                                </div>
                            </div>

                            <hr className="w-full border-gray-300" />

                            <div className="text-[17px] py-3 h-[calc(100%-60px)] text-black overflow-y-scroll w-full flex flex-col gap-1 mb-1 items-start justify-start">
                                {itemElements}
                            </div>
                        </div>
                    </motion.aside>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

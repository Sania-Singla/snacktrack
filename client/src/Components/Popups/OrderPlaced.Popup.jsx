import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '..';
import { icons } from '../../Assets/icons';
import { usePopupContext } from '../../Contexts';

export default function OrderPlacedPopup() {
    const { setShowPopup, popupInfo } = usePopupContext();
    const navigate = useNavigate();

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { type: 'spring', damping: 25, stiffness: 300 },
        },
        exit: { opacity: 0, scale: 0.9 },
    };

    const checkmarkVariants = {
        hidden: { pathLength: 0, opacity: 0 },
        visible: {
            pathLength: 1,
            opacity: 1,
            transition: { duration: 0.5, ease: 'easeInOut' },
        },
    };

    return (
        <AnimatePresence>
            <motion.div
                className="relative w-[350px] sm:w-[450px] transition-all duration-300 overflow-hidden bg-white rounded-xl drop-shadow-md px-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                <Button
                    btnText={
                        <div className="size-[20px] stroke-black">
                            {icons.cross}
                        </div>
                    }
                    title="Close"
                    onClick={() => setShowPopup(false)}
                    className="absolute top-2 right-2 z-10"
                />

                <div className="flex flex-col items-center gap-4 py-8 relative">
                    {/* Animated Checkmark */}
                    <motion.div
                        className="relative size-14 p-[5px] bg-green-100 mb-1 rounded-full z-10"
                        initial={{ scale: 0 }}
                        animate={{
                            scale: 1,
                            transition: {
                                type: 'spring',
                                stiffness: 260,
                                damping: 20,
                            },
                        }}
                    >
                        <svg
                            className="size-full"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <motion.path
                                d="M5 13L9 17L19 7"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                variants={checkmarkVariants}
                                initial="hidden"
                                animate="visible"
                                className="text-green-600"
                            />
                        </svg>
                    </motion.div>

                    {/* Confetti Animation - Full Width */}
                    <motion.div
                        className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, transition: { delay: 0.3 } }}
                    >
                        {[...Array(25)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute size-2 rounded-full"
                                style={{
                                    backgroundColor: [
                                        '#f59e0b', // yellow
                                        '#ef4444', // red
                                        '#3b82f6', // blue
                                        '#10b981', // green
                                        '#8b5cf6', // purple
                                    ][Math.floor(Math.random() * 5)],
                                    left: `${Math.random() * 100}%`,
                                }}
                                initial={{
                                    y: -20,
                                    rotate: Math.random() * 360,
                                    opacity: 0,
                                }}
                                animate={{
                                    y: [0, window.innerHeight * 0.5],
                                    opacity: [1, 0],
                                    x: [
                                        0,
                                        Math.random() * 40 - 20, // slight horizontal drift
                                        Math.random() * 40 - 20,
                                    ],
                                    transition: {
                                        duration: 1.5 + Math.random(),
                                        delay: i * 0.05,
                                        repeat: Infinity,
                                        repeatDelay: 2,
                                        ease: 'linear',
                                    },
                                }}
                            />
                        ))}
                    </motion.div>

                    <motion.h2
                        className="text-2xl font-bold text-gray-900"
                        initial={{ y: 10, opacity: 0 }}
                        animate={{
                            y: 0,
                            opacity: 1,
                            transition: { delay: 0.4 },
                        }}
                    >
                        Order Placed!
                    </motion.h2>

                    <motion.p
                        className="text-gray-600 z-10"
                        initial={{ y: 10, opacity: 0 }}
                        animate={{
                            y: 0,
                            opacity: 1,
                            transition: { delay: 0.5 },
                        }}
                    >
                        <span className="font-semibold">Items:</span>{' '}
                        {popupInfo.data.itemsCount}
                    </motion.p>

                    <motion.p
                        className="text-center text-gray-600 mb-4 z-10"
                        initial={{ y: 10, opacity: 0 }}
                        animate={{
                            y: 0,
                            opacity: 1,
                            transition: { delay: 0.6 },
                        }}
                    >
                        We'll notify you when your order is ready for pickup.
                    </motion.p>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{
                            y: 0,
                            opacity: 1,
                            transition: { delay: 0.7 },
                        }}
                        className="w-full"
                    >
                        <Button
                            btnText="View My Orders"
                            onClick={() => {
                                setShowPopup(false);
                                navigate('/my-orders');
                            }}
                            className="text-white rounded-md py-2 flex items-center justify-center text-lg w-full bg-[#4977ec] hover:bg-[#3b62c2]"
                        />
                    </motion.div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

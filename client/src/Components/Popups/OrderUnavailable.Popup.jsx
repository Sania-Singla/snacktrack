import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '..';
import { icons } from '../../Assets/icons';
import { usePopupContext } from '../../Contexts';

export default function OrderUnavailablePopup() {
    const { setShowPopup } = usePopupContext();

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { type: 'spring', damping: 25, stiffness: 300 },
        },
        exit: { opacity: 0, scale: 0.9 },
    };

    const crossMarkVariants = {
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
                    {/* Animated Cross Mark */}
                    <motion.div
                        className="relative size-13 p-[5px] bg-red-100 mb-1 rounded-full z-10"
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
                                d="M18 6L6 18"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                variants={crossMarkVariants}
                                initial="hidden"
                                animate="visible"
                                className="text-red-600"
                            />
                            <motion.path
                                d="M6 6L18 18"
                                stroke="currentColor"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                variants={crossMarkVariants}
                                initial="hidden"
                                animate="visible"
                                className="text-red-600"
                            />
                        </svg>
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
                        Error !!
                    </motion.h2>

                    <motion.p
                        className="text-center text-gray-600 z-10"
                        initial={{ y: 10, opacity: 0 }}
                        animate={{
                            y: 0,
                            opacity: 1,
                            transition: { delay: 0.6 },
                        }}
                    >
                        Sorry, this order contains items that are currently
                        unavailable.
                    </motion.p>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

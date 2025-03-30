import { motion } from 'framer-motion';
import { Button } from '..';
import { useNavigate } from 'react-router-dom';

export default function EmptyCart() {
    // variants
    const textAnimation = {
        initial: { y: 20, opacity: 0 },
        animate: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.5, delay: 0.3 },
        },
    };

    const iconAnimation = {
        initial: { scale: 0, rotate: -30 },
        animate: {
            scale: 1,
            rotate: 0,
            transition: { duration: 0.8, type: 'spring', bounce: 0.5 },
        },
        hover: { rotate: 10, transition: { duration: 0.3 } },
    };

    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-center h-[calc(100vh-92px)]">
            <div className="text-center flex flex-col items-center max-w-[400px]">
                {/* Bag Icon */}
                <motion.div
                    variants={iconAnimation}
                    initial="initial"
                    animate="animate"
                    whileHover="hover"
                    className="mb-5"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 64 64"
                        className="size-24"
                    >
                        {/* Gradient Background */}
                        <defs>
                            <linearGradient
                                id="gradient"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="100%"
                            >
                                <stop
                                    offset="0%"
                                    style={{
                                        stopColor: '#6EE7B7',
                                        stopOpacity: 1,
                                    }}
                                />
                                <stop
                                    offset="50%"
                                    style={{
                                        stopColor: '#3B82F6',
                                        stopOpacity: 1,
                                    }}
                                />
                                <stop
                                    offset="100%"
                                    style={{
                                        stopColor: '#9333EA',
                                        stopOpacity: 1,
                                    }}
                                />
                            </linearGradient>
                        </defs>
                        <motion.path
                            d="M45 18h-6v-4c0-3.3-2.7-6-6-6h-6c-3.3 0-6 2.7-6 6v4h-6c-3.3 0-6 2.7-6 6v28c0 3.3 2.7 6 6 6h30c3.3 0 6-2.7 6-6V24c0-3.3-2.7-6-6-6zm-18-4c1.1 0 2 .9 2 2v4h-4v-4c0-1.1.9-2 2-2zm18 32c0 1.1-.9 2-2 2H13c-1.1 0-2-.9-2-2V24c0-1.1.9-2 2-2h6v4c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2v-4h6c1.1 0 2 .9 2 2v28z"
                            fill="url(#gradient)"
                            stroke="none"
                        />
                    </svg>
                </motion.div>

                <motion.h1
                    variants={textAnimation}
                    initial="initial"
                    animate="animate"
                    className="text-2xl font-bold text-gray-900 mb-3"
                >
                    Your Cart is Empty
                </motion.h1>

                <motion.p
                    variants={textAnimation}
                    initial="initial"
                    animate="animate"
                    className="text-gray-600 mb-8"
                >
                    Looks like you haven't added anything to your cart yet.
                </motion.p>

                <Button
                    btnText="Continue Shopping"
                    onClick={() => navigate('/')}
                    className="text-white rounded-md py-2 h-[40px] text-lg flex items-center justify-center w-[70%] bg-[#4977ec] hover:bg-[#3b62c2]"
                />
            </div>
        </div>
    );
}

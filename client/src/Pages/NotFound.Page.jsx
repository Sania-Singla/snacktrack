import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { icons } from '../Assets/icons';

export default function NotFoundPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-sky-500 to-blue-600 p-6">
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-md w-full text-center"
            >
                {/* Error Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="flex items-center justify-center"
                >
                    <div className="size-16 fill-gray-800">{icons.bug}</div>
                </motion.div>

                {/* Error Message */}
                <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="text-4xl font-bold text-gray-800 mt-6"
                >
                    404 - Page Not Found
                </motion.h1>
                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.9, duration: 0.5 }}
                    className="text-gray-600 mt-4"
                >
                    Oops! The page you're looking for doesn't exist.
                </motion.p>

                {/* Back to Home Button */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 1.1, duration: 0.5 }}
                    className="mt-8"
                >
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold rounded-lg shadow-md hover:from-sky-600 hover:to-blue-700 transition-all duration-300"
                    >
                        <span>Go Back Home</span>
                        <div className="ml-2 size-5 fill-white">
                            {icons.rightArrow}
                        </div>
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
}

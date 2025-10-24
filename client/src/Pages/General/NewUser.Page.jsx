import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../Components';
import { motion } from 'framer-motion';
import { useUserContext } from '../../Contexts';

export default function NewUserPage() {
    const navigate = useNavigate();
    const { user } = useUserContext();
    const links = [
        { name: 'Privacy Policy', link: '/privacy-policy' },
        { name: 'Contact', link: '/contact' },
        { name: 'About us', link: '/about' },
    ];

    const linkElements = links.map((link) => (
        <Link
            key={link.name}
            to={link.link}
            className="text-gray-500 hover:underline"
        >
            {link.name}
        </Link>
    ));

    return (
        <div className="text-center min-h-screen bg-gradient-to-r from-sky-500 to-blue-600 flex items-center justify-center p-5">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:px-8 pt-5 w-fit">
                <h1 className="text-[22px] font-bold text-gray-800 mb-6 animate-fade-in">
                    Welcome to SnackTrack!
                </h1>

                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-yellow-800 font-semibold mb-2 text-sm">
                        🚀 Prototype Demo
                    </p>
                    <Button
                        onClick={() => navigate('/demo')}
                        className="bg-yellow-500 text-yellow-900 px-4 py-2 rounded-md font-bold hover:bg-yellow-400 text-sm w-full shadow-md"
                        btnText="View Demo Credentials"
                    />
                </div>

                <div className="relative mb-3">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-3 bg-white text-gray-600 font-medium">
                            New here ?
                        </span>
                    </div>
                </div>

                <p className="text-gray-500 mb-6 text-sm">
                    Please visit your nearest Point of Contact to get registered
                </p>

                {/* Animated Icon */}
                <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="mb-5 flex justify-center"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ color: '#3a67d8' }}
                        className="size-10"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                    </svg>
                </motion.div>

                <Button
                    onClick={() => navigate('/login')}
                    className="bg-[#3a67d8] mb-6 text-white w-full py-2 rounded-md font-medium hover:bg-[#2c4fa8] text-sm"
                    btnText="Sign In"
                />

                <div className="relative mb-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-3 bg-white text-gray-600 font-medium">
                            Staff Access
                        </span>
                    </div>
                </div>

                <div className="flex gap-2 justify-center">
                    <Button
                        onClick={() => navigate('/admin')}
                        btnText="Admin"
                        className="bg-[#3a67d8] text-white w-full py-2 rounded-md font-medium hover:bg-[#2c4fa8] text-sm"
                    />
                    <Button
                        onClick={() =>
                            navigate(
                                user?.role === 'contractor'
                                    ? '/'
                                    : '/verify-kitchen-key'
                            )
                        }
                        btnText="Kitchen"
                        className="bg-[#3a67d8] text-white w-full py-2 rounded-md font-medium hover:bg-[#2c4fa8] text-sm"
                    />
                </div>

                <div className="flex gap-3 items-center w-full justify-center mt-5 text-xs">
                    {linkElements}
                </div>
            </div>
        </div>
    );
}

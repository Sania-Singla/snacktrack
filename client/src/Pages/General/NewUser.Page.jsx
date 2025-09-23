import { useNavigate } from 'react-router-dom';
import { Button } from '../../Components';

export default function NewUserPage() {
    const navigate = useNavigate();

    return (
        <div className="text-center min-h-screen bg-gradient-to-r from-sky-500 to-blue-600 flex items-center justify-center p-5">
            <div className="bg-white rounded-xl shadow-sm p-7 w-fit">
                <h1 className="text-2xl font-bold text-gray-800 mb-6 animate-fade-in">
                    Welcome to SnackTrack!
                </h1>

                <div className="mb-5">
                    <p className="text-gray-600 mb-5 text-sm">
                        Already registered ? Sign in to continue your
                        experience.
                    </p>
                    <Button
                        onClick={() => navigate('/login')}
                        className="bg-[#3a67d8] text-white px-4 py-1.5 rounded-md font-semibold hover:bg-[#2c4fa8] text-sm"
                        btnText="Sign In"
                    />
                </div>

                {/* Divider */}
                <div className="relative mb-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-3 bg-white text-gray-600 font-medium">
                            New to SnackTrack ?
                        </span>
                    </div>
                </div>

                <p className="text-gray-500 mb-6 text-sm">
                    Please visit your nearest Point of Contact to get started
                </p>

                {/* Animated Icon */}
                <div className="mb-3 flex justify-center animate-bounce animate-infinite animate-duration-2000">
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
                </div>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-3 bg-white text-gray-600 font-medium">
                            Staff Access
                        </span>
                    </div>
                </div>

                <div className="flex gap-3 justify-center sm:px-4">
                    <Button
                        onClick={() => navigate('/admin')}
                        btnText="Admin"
                        className="bg-gray-700 text-white py-2 rounded-md hover:bg-gray-800 flex-1"
                    />
                    <Button
                        onClick={() => navigate('/kitchen')}
                        btnText="Kitchen"
                        className="bg-emerald-600 text-white py-2 rounded-md hover:bg-emerald-700 flex-1"
                    />
                </div>
            </div>
        </div>
    );
}

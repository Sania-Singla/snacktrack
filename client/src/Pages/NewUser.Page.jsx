import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../Components';

export default function NewUserPage() {
    const navigate = useNavigate();

    return (
        <div className="text-center min-h-screen bg-gradient-to-r from-sky-500 to-blue-600 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full transform transition-all duration-500 hover:scale-105">
                <h1 className="text-3xl font-bold text-gray-800 mb-4 animate-fade-in">
                    Welcome to Our System!
                </h1>
                <p className="text-gray-600 mb-6 animate-fade-in animate-delay-100">
                    <Link
                        to="/login"
                        style={{ color: '#3a67d8' }}
                        className="font-semibold underline hover:opacity-80 transition-opacity duration-300"
                    >
                        Login
                    </Link>{' '}
                    if you have an account or visit your nearest POC for
                    registration.
                </p>

                {/* Animated Icon */}
                <div className="mb-6 flex justify-center animate-bounce animate-infinite animate-duration-2000">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ color: '#3a67d8' }}
                        className="h-12 w-12"
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

                {/* Staff Controls */}
                <div className="animate-fade-in animate-delay-200">
                    <p className="text-gray-600 mb-4">
                        Staff member? Access your controls:
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                            onClick={() => navigate('/admin')}
                            btnText="Admin Panel"
                            className="bg-[#3a67d8] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#2c4fa8] flex-1"
                        />
                        <Button
                            onClick={() => navigate('/kitchen')}
                            btnText="Kitchen Dashboard"
                            className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-700 flex-1"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

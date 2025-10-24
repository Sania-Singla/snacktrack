import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../Components';
import toast from 'react-hot-toast';

export default function DemoCredentialsPage() {
    const navigate = useNavigate();
    const [activeRole, setActiveRole] = useState('contractor');

    const credentials = {
        contractor: {
            hostel: 'WWH1 - Sushila Nayyar Hall',
            password: '12345678',
            description: 'Access contractor features and management tools',
            dashboardPath: '/contractor',
        },
        student: {
            hostel: 'WWH1 - Sushila Nayyar Hall',
            rollNo: '5',
            password: '12345678',
            description: 'Access student dashboard and meal tracking',
            dashboardPath: '/student',
        },
        admin: {
            key: 'snacktrack@admin',
            description: 'Full administrative access to the system',
            dashboardPath: '/admin',
        },
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
    };

    const RoleCard = ({ role, title, icon }) => (
        <div
            className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                activeRole === role
                    ? 'border-[#3a67d8] bg-blue-50 shadow-md'
                    : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            onClick={() => setActiveRole(role)}
        >
            <div className="flex items-center space-x-3">
                <div
                    className={`p-1.5 rounded-full ${
                        activeRole === role
                            ? 'bg-[#3a67d8] text-white'
                            : 'bg-gray-100 text-gray-600'
                    }`}
                >
                    {icon}
                </div>
                <span
                    className={`font-semibold ${
                        activeRole === role ? 'text-[#3a67d8]' : 'text-gray-700'
                    }`}
                >
                    {title}
                </span>
            </div>
        </div>
    );

    const UserIcon = () => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
        >
            <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
            />
        </svg>
    );

    const StudentIcon = () => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
        >
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
        </svg>
    );

    const AdminIcon = () => (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
        >
            <path
                fillRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                clipRule="evenodd"
            />
        </svg>
    );

    const currentCredential = credentials[activeRole];

    return (
        <div className="min-h-screen bg-gradient-to-r from-sky-500 to-blue-600 flex items-center justify-center p-5">
            <div className="bg-white rounded-xl shadow-sm p-7 max-w-4xl w-full">
                <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">
                    Demo Credentials
                </h1>
                <p className="text-gray-600 text-center mb-6">
                    Use these credentials to explore different roles in the
                    SnackTrack prototype
                </p>

                {/* Role Selection */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                    <RoleCard
                        role="contractor"
                        title="Contractor"
                        icon={<UserIcon />}
                    />
                    <RoleCard
                        role="student"
                        title="Student"
                        icon={<StudentIcon />}
                    />
                    <RoleCard role="admin" title="Admin" icon={<AdminIcon />} />
                </div>

                {/* Credentials Display */}
                <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 capitalize">
                        {activeRole} Credentials
                    </h3>

                    <p className="text-gray-600 mb-4 text-sm">
                        {currentCredential.description}
                    </p>

                    <div className="space-y-3">
                        {currentCredential.email && (
                            <div className="flex items-center justify-between bg-white p-3 rounded-md border border-gray-200">
                                <div>
                                    <p className="text-xs text-gray-500">
                                        Email
                                    </p>
                                    <p className="text-gray-800 font-mono text-sm">
                                        {currentCredential.email}
                                    </p>
                                </div>
                                <Button
                                    onClick={() =>
                                        copyToClipboard(currentCredential.email)
                                    }
                                    className="bg-[#3a67d8] text-white px-3 py-1 rounded text-xs hover:bg-[#2c4fa8]"
                                    btnText="Copy"
                                />
                            </div>
                        )}

                        {currentCredential.hostel && (
                            <div className="flex items-center justify-between bg-white p-3 rounded-md border border-gray-200">
                                <div>
                                    <p className="text-xs text-gray-500">
                                        Hostel
                                    </p>
                                    <p className="text-gray-800 font-mono text-sm">
                                        {currentCredential.hostel}
                                    </p>
                                </div>
                                <div className="bg-gray-200 text-black px-3 py-1 rounded text-xs">
                                    Select from Dropdown
                                </div>
                            </div>
                        )}

                        {currentCredential.rollNo && (
                            <div className="flex items-center justify-between bg-white p-3 rounded-md border border-gray-200">
                                <div>
                                    <p className="text-xs text-gray-500">
                                        Roll Number
                                    </p>
                                    <p className="text-gray-800 font-mono text-sm">
                                        {currentCredential.rollNo}
                                    </p>
                                </div>
                                <Button
                                    onClick={() =>
                                        copyToClipboard(
                                            currentCredential.rollNo
                                        )
                                    }
                                    className="bg-[#3a67d8] text-white px-3 py-1 rounded text-xs hover:bg-[#2c4fa8]"
                                    btnText="Copy"
                                />
                            </div>
                        )}

                        {currentCredential.password && (
                            <div className="flex items-center justify-between bg-white p-3 rounded-md border border-gray-200">
                                <div>
                                    <p className="text-xs text-gray-500">
                                        Password
                                    </p>
                                    <p className="text-gray-800 font-mono text-sm">
                                        {currentCredential.password}
                                    </p>
                                </div>
                                <Button
                                    onClick={() =>
                                        copyToClipboard(
                                            currentCredential.password
                                        )
                                    }
                                    className="bg-[#3a67d8] text-white px-3 py-1 rounded text-xs hover:bg-[#2c4fa8]"
                                    btnText="Copy"
                                />
                            </div>
                        )}

                        {currentCredential.key && (
                            <div className="flex items-center justify-between bg-white p-3 rounded-md border border-gray-200">
                                <div>
                                    <p className="text-xs text-gray-500">
                                        Access Key
                                    </p>
                                    <p className="text-gray-800 font-mono text-sm">
                                        {currentCredential.key}
                                    </p>
                                </div>
                                <Button
                                    onClick={() =>
                                        copyToClipboard(currentCredential.key)
                                    }
                                    className="bg-[#3a67d8] text-white px-3 py-1 rounded text-xs hover:bg-[#2c4fa8]"
                                    btnText="Copy"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Access Buttons */}
                <div className="grid grid-cols-2 gap-4">
                    <Button
                        onClick={() =>
                            activeRole === 'admin'
                                ? navigate('/admin')
                                : activeRole === 'contractor'
                                  ? navigate('/verify-kitchen-key')
                                  : navigate('/login')
                        }
                        className="bg-[#3a67d8] text-white py-2 rounded-md font-semibold hover:bg-[#2c4fa8]"
                        btnText={`Go to ${activeRole === 'admin' ? activeRole.charAt(0).toUpperCase() + activeRole.slice(1) + ' Dashboard' : 'Login'}`}
                    />
                    <Button
                        onClick={() => navigate('/')}
                        className="bg-gray-600 text-white py-2 rounded-md font-semibold hover:bg-gray-700"
                        btnText="Back to Home"
                    />
                </div>
            </div>
        </div>
    );
}

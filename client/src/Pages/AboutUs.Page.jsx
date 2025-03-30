import { CONTRIBUTORS } from '../Constants/constants';
import { Link } from 'react-router-dom';

function FeatureCard({ title, description }) {
    return (
        <div className="bg-white shadow-md rounded-xl p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-gray-700 mt-2">{description}</p>
        </div>
    );
}

function PrivacyCard({ title, description }) {
    return (
        <div className="bg-white shadow-md rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-gray-700 mt-2">{description}</p>
        </div>
    );
}
export default function AboutUsPage() {
    return (
        <div className="w-full min-h-screen">
            {/* Hero Section */}
            <section className="w-full bg-white shadow-md rounded-xl py-10 px-8 md:px-16">
                <h1 className="text-4xl font-bold text-gray-900">About Us</h1>
                <p className="mt-4 text-lg text-gray-700 max-w-3xl">
                    Welcome to <strong>Hostel Canteen Management</strong>, a
                    platform designed to enhance transparency, efficiency, and
                    security in hostel dining services. Our goal is to provide
                    real-time meal tracking, structured billing, and a seamless
                    feedback system.
                </p>
            </section>

            {/* Content Section with Grid Layout */}
            <div className="w-full px-8 md:px-16 py-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Mission */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        Our Mission
                    </h2>
                    <p className="text-gray-700 mt-3">
                        We aim to eliminate manual discrepancies, enhance food
                        quality monitoring, and ensure a fair billing system in
                        hostel canteens. Our platform provides students with
                        real-time access to meal consumption, expenses, and
                        feedback submissions.
                    </p>
                </div>

                {/* Why We Started */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        Why We Started
                    </h2>
                    <p className="text-gray-700 mt-3">
                        Many hostel residents face challenges such as inaccurate
                        meal deductions and lack of transparency. Our system
                        centralizes meal tracking, payment management, and
                        feedback submission in a streamlined, user-friendly
                        interface.
                    </p>
                </div>
            </div>

            {/* Features Section */}
            <section className="w-full px-8 md:px-16 py-10 bg-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 text-center">
                    Key Features
                </h2>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <FeatureCard
                        title="📅 Daily Menu Display"
                        description="Check what's being served in real time."
                    />
                    <FeatureCard
                        title="💳 Automated Billing"
                        description="Transparent meal tracking with detailed statements."
                    />
                    <FeatureCard
                        title="⭐ Feedback & Ratings"
                        description="Raise concerns and rate food quality easily."
                    />
                    <FeatureCard
                        title="🔒 Secure Authentication"
                        description="Only verified students can access records."
                    />
                    <FeatureCard
                        title="🔔 Live Notifications"
                        description="Get meal, deduction, and policy change alerts."
                    />
                </div>
            </section>

            {/* Meet the Team */}
            <section className="w-full px-8 md:px-16 py-12 text-center">
                <h2 className="text-2xl font-bold text-gray-900">
                    Meet the Team
                </h2>
                <p className="text-gray-700 mt-3">
                    Our team of developers and canteen administrators work
                    together to ensure smooth operations and a transparent
                    dining experience.
                </p>
                <div className="flex w-full justify-center">
                    <div className="mt-8 flex flex-wrap justify-evenly gap-x-4 gap-y-8 w-full">
                        {CONTRIBUTORS.map((contributor) => (
                            <div
                                key={contributor.name}
                                className="flex flex-col items-center"
                            >
                                <div className="size-24 rounded-full overflow-hidden shadow-lg hover:brightness-90">
                                    <img
                                        src={contributor.image}
                                        alt={contributor.name}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                                <p className="mt-2 font-semibold text-gray-800">
                                    {contributor.name}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Privacy & Security */}
            <section className="w-full px-8 md:px-16 py-12 bg-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 text-center">
                    Privacy & Security
                </h2>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <PrivacyCard
                        title="🔹 Secure Transactions"
                        description="All financial transactions are end-to-end encrypted."
                    />
                    <PrivacyCard
                        title="🔹 Access Control"
                        description="Data access is restricted to registered students and administrators."
                    />
                    <PrivacyCard
                        title="🔹 Data Encryption"
                        description="All personal and financial details are securely stored."
                    />
                    <PrivacyCard
                        title="🔹 Fraud Prevention"
                        description="Real-time monitoring ensures security and integrity."
                    />
                </div>
            </section>

            {/* Contact Section */}
            <section className="w-full px-8 md:px-16 py-12 text-center">
                <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
                <p className="text-md text-gray-700 mt-3">
                    For inquiries or assistance, reach out to our support team
                    via{' '}
                    <Link
                        to="https://discord.gg/example"
                        target="_blank"
                        className="text-blue-500 font-medium hover:underline"
                    >
                        Discord
                    </Link>{' '}
                    or visit the hostel office.
                </p>
            </section>
        </div>
    );
}

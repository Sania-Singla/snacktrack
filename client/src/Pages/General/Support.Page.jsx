import { CONTRIBUTORS, EMAIL } from '../../Constants/constants';
import { ContributorCard } from '../../Components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { icons } from '../../Assets/icons';

const contributorElements = CONTRIBUTORS?.map((contributor) => (
    <ContributorCard key={contributor.name} contributor={contributor} />
));

export default function SupportPage() {
    return (
        <div className="w-full min-h-screen p-4">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="text-center flex flex-col items-center gap-4 mb-6"
            >
                <div className="bg-white rounded-full p-3 shadow-sm hover:scale-105 duration-300 transition-all">
                    <div className="size-[70px] fill-[#3a67d8]">
                        {icons.support}
                    </div>
                </div>

                <h1 className="font-bold text-3xl text-gray-900">
                    Connect for Any Issue or Support
                </h1>
                <p className="text-gray-600 max-w-[600px]">
                    Our dedicated team is here to help you. Reach out anytime
                    for support, guidance, or assistance.
                </p>
            </motion.div>

            {/* Contributors Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, staggerChildren: 0.1 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl mx-auto"
            >
                {contributorElements}
            </motion.div>

            {/* Enhanced Support Options Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-14 max-w-4xl mx-auto bg-white rounded-2xl p-8 sm:p-10 shadow-sm"
            >
                <div className="text-center space-y-8">
                    <h2 className="text-2xl font-bold text-gray-900">
                        <span className="bg-clip-text">
                            More Ways to Connect
                        </span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Email Card */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="border border-blue-300 p-6 rounded-xl shadow-sm hover:shadow-lg transition-all group"
                        >
                            <div className="flex justify-center mb-4">
                                <span className="text-4xl">📧</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                                Email Support
                            </h3>
                            <p className="text-gray-600 text-sm mb-3">
                                Get detailed help via email
                            </p>
                            <div className="text-blue-600 font-mono text-xs bg-blue-50 px-2 py-1 rounded-md inline-block group-hover:bg-blue-100 transition">
                                {EMAIL}
                            </div>
                        </motion.div>

                        {/* Chat Card */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="border border-blue-300 p-6 rounded-xl shadow-sm hover:shadow-lg transition-all group"
                        >
                            <div className="flex justify-center mb-4">
                                <span className="text-4xl">💬</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                                Instant Chat
                            </h3>
                            <p className="text-gray-600 text-sm mb-3">
                                Real-time assistance
                            </p>
                            <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-md inline-block">
                                Online now
                            </div>
                        </motion.div>

                        {/* FAQ Card */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="border border-blue-300 p-6 rounded-xl shadow-sm hover:shadow-lg transition-all group"
                        >
                            <div className="flex justify-center mb-4">
                                <span className="text-4xl">❓</span>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2 text-lg">
                                FAQ Center
                            </h3>
                            <p className="text-gray-600 text-sm mb-3">
                                Quick answers to common questions
                            </p>
                            <Link
                                to="/faqs"
                                className="text-xs bg-blue-50 hover:bg-blue-100 px-2 py-1 text-blue-500 rounded-md inline-block transition-colors"
                            >
                                Visit FAQs →
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

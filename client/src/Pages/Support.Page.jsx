import { icons } from '../Assets/icons';
import { CONTRIBUTORS } from '../Constants/constants';
import { ContributorCard } from '../Components';
import { motion } from 'framer-motion';

const contributorElements = CONTRIBUTORS?.map((contributor) => (
    <ContributorCard key={contributor.name} contributor={contributor} />
));

export default function SupportPage() {
    return (
        <div className="w-full flex flex-col items-center justify-center p-4 bg-gradient-to-b from-[#f9f9f9] to-[#f2f2f2] rounded-xl">
            {/* Header Section */}
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="text-center flex flex-col items-center gap-4 mb-6"
            >
                <div className="bg-white rounded-full p-3 shadow-lg hover:scale-105 transition">
                    <div className="size-[90px] fill-[#3a67d8]">
                        {icons.support}
                    </div>
                </div>

                <h1 className="font-bold text-4xl text-gray-900">
                    Connect for Any Issue or Support
                </h1>
                <p className="text-lg text-gray-600 max-w-[600px]">
                    Our dedicated team is here to help you. Reach out anytime
                    for support, guidance, or assistance.
                </p>
            </motion.div>

            {/* Contributors Section */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl"
            >
                {contributorElements}
            </motion.div>
        </div>
    );
}

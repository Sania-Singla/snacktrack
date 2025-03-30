import { Link } from 'react-router-dom';
import { icons } from '../../Assets/icons';
import { motion } from 'framer-motion';

export default function ContributorCard({ contributor }) {
    const { name, role, bio, image, socials } = contributor;

    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
            className="relative bg-white/20 backdrop-blur-lg border border-white/40 shadow-xl rounded-2xl overflow-hidden p-6 flex flex-col items-center gap-4 max-w-sm"
        >
            {/* Profile Image */}
            <div className="w-32 h-32 overflow-hidden rounded-full border-4 border-gray-300 shadow-md">
                <img
                    src={image}
                    alt={`${name} profile`}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Contributor Details */}
            <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900">{name}</h3>
                <p className="text-blue-600 font-semibold text-sm">{role}</p>
                <p className="text-gray-600 text-sm mt-2 line-clamp-3">{bio}</p>
            </div>

            {/* Social Media Links */}
            <div className="flex gap-4 mt-4">
                {Object.entries(socials).map(([platform, url]) =>
                    url ? (
                        <Link key={platform} to={url} target="_blank">
                            <motion.div
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                className="bg-gray-200 p-2 rounded-full shadow-md hover:bg-gray-300 transition"
                            >
                                <div className="size-5">{icons[platform]}</div>
                            </motion.div>
                        </Link>
                    ) : null
                )}
            </div>

            {/* Floating Glow Effect */}
            <div className="absolute inset-0 rounded-2xl bg-white/5 blur-lg opacity-50 pointer-events-none" />
        </motion.div>
    );
}

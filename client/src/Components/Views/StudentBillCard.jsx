import { getRollNo } from '../../Utils';
import { icons } from '../../Assets/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import BillCard from './BillCard';

export default function StudentBillCard({ student }) {
    const { _id, avatar, fullName, userName, email, phoneNumber, bills } =
        student;
    const [expanded, setExpanded] = useState(false);

    const billElements = bills.map((b) => <BillCard key={b._id} bill={b} />);

    return (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md h-fit">
            <div
                className="p-3 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex justify-between items-center w-full">
                    {/* User Info Section */}
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full overflow-hidden drop-shadow-sm">
                            <img
                                src={avatar}
                                alt={`${fullName} image`}
                                className="size-full object-cover"
                            />
                        </div>
                        <div className="flex-1 space-y-[2px]">
                            <h3 className="flex items-center gap-1">
                                <span className="font-medium text-sm text-gray-800 truncate">
                                    {fullName}
                                </span>
                                <span className="text-xs text-gray-600">•</span>
                                <span className="text-xs text-gray-600">
                                    Roll No: {getRollNo(userName)}
                                </span>
                            </h3>
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                                {phoneNumber}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-end flex-col gap-[5px]">
                        <div
                            className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
                        >
                            <div className="size-[10px] fill-gray-500">
                                {icons.arrowDown}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="p-3 border-t border-gray-100 space-y-3">
                            {billElements.length > 0 ? (
                                billElements
                            ) : (
                                <span className="text-xs italic text-gray-500">
                                    No bills found
                                </span>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

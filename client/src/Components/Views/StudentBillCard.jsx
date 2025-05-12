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
                className="p-4 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex justify-between items-center w-full">
                    <div className="flex items-center justify-start gap-4">
                        {/* avatar */}
                        <div>
                            <div className="size-[80px] overflow-hidden rounded-full drop-shadow-md">
                                <img
                                    alt="student avatar"
                                    src={avatar}
                                    className="size-full object-cover"
                                />
                            </div>
                        </div>

                        {/* info */}
                        <div className="">
                            <div className="text-ellipsis line-clamp-1 hover:text-[#5c5c5c] text-[16px] font-semibold text-black w-fit">
                                {fullName}
                            </div>

                            <div className="text-black hover:text-[#5c5c5c] text-[12px] w-fit">
                                <span className="font-medium">Roll No: </span>
                                {getRollNo(userName)}
                            </div>

                            <div className="text-black hover:text-[#5c5c5c] text-[12px] w-fit">
                                <span className="font-medium">
                                    Phone Number:{' '}
                                </span>{' '}
                                {phoneNumber}
                            </div>

                            <div className="text-black hover:text-[#5c5c5c] text-[12px] w-fit">
                                <span className="font-medium">Email: </span>{' '}
                                {email}
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

import { icons } from '../../Assets/icons';
import { formatTime } from '../../Utils';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { OrderItem, OrderStudentInfo, OrderTotal } from '..';

export default function StaticOrderCard({ order, reference }) {
    const [expanded, setExpanded] = useState(false);
    const { amount, _id, createdAt, items, studentInfo, extraCharges, status } =
        order;

    return (
        <div
            ref={reference}
            className="h-fit w-full bg-white rounded-md shadow-xs border-1 border-gray-200 overflow-visible transition-all hover:shadow-sm"
        >
            <div
                className="p-3 cursor-pointer"
                onClick={() => setExpanded((prev) => !prev)}
            >
                <div className="flex justify-between items-center mb-2 w-full">
                    <OrderStudentInfo studentInfo={studentInfo} />

                    {status === 'Pending' && (
                        <div className="w-fit px-2.5 pt-0.5 pb-1 text-xs font-medium rounded-full bg-yellow-50 text-yellow-700">
                            Pending
                        </div>
                    )}

                    {status === 'Prepared' && (
                        <div className="w-fit px-2.5 pt-0.5 pb-1 text-xs font-medium rounded-full bg-purple-50 text-purple-700">
                            Prepared
                        </div>
                    )}

                    {status === 'PickedUp' && (
                        <div className="fill-green-600 size-4 m-1">
                            {icons.checkWithoutCircle}
                        </div>
                    )}

                    {status === 'Rejected' && (
                        <span className="px-2.5 pt-0.5 pb-1 text-xs font-medium rounded-full bg-red-50 text-red-700">
                            Rejected
                        </span>
                    )}
                </div>

                <div className="flex justify-between items-center w-full">
                    <div className="flex flex-col gap-1">
                        <p className="text-[0.8rem] font-medium text-gray-800">
                            ORDER #{_id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-500">
                            {formatTime(createdAt)}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="font-semibold text-gray-900">
                            ₹{(amount + extraCharges).toFixed(2)}
                        </span>
                        <div
                            className={`transition-transform ${expanded ? 'rotate-180' : ''} size-3 fill-gray-500`}
                        >
                            {icons.arrowDown}
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ opacity: 0, maxHeight: 0 }}
                        animate={{ opacity: 1, maxHeight: 1000 }}
                        exit={{ opacity: 0, maxHeight: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden border-t border-gray-100"
                    >
                        {order.items.map((item) => (
                            <OrderItem
                                item={item}
                                order={order}
                                key={item.id}
                                type="static"
                            />
                        ))}

                        <OrderTotal order={order} type="static" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

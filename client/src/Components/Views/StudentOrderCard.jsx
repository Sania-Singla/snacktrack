import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { icons } from '../../Assets/icons';
import { formatTime } from '../../Utils';
import { OrderItem, OrderTotal } from '..';

export default function StudentOrderCard({ order, reference }) {
    const [expanded, setExpanded] = useState(false);
    const { amount, _id, createdAt, status, items, extraCharges } = order;

    return (
        <div
            ref={reference}
            className="bg-white rounded-md shadow-xs border-1 border-gray-100 overflow-hidden transition-all hover:shadow-sm h-fit"
        >
            <div
                className="p-3 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex justify-between items-center w-full">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-[0.8rem] font-medium text-gray-800 mb-1">
                            ORDER #{_id.slice(-8).toUpperCase()}
                        </h2>
                        <p className="text-xs text-gray-500">
                            {formatTime(createdAt)}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        {status === 'Pending' && (
                            <div className="w-fit px-2.5 pt-0.5 pb-1 text-xs font-medium rounded-full bg-yellow-50 text-yellow-700">
                                Pending
                            </div>
                        )}

                        {status === 'Prepared' && (
                            <div className="w-fit px-2.5 pt-0.5 pb-1 text-xs font-medium rounded-full bg-green-50 text-green-700">
                                Ready
                            </div>
                        )}

                        {status === 'PickedUp' && (
                            <div className="fill-green-600 size-4 mr-2">
                                {icons.checkWithoutCircle}
                            </div>
                        )}

                        {status === 'Rejected' && (
                            <div className="w-fit px-2.5 pt-0.5 pb-1 text-xs font-medium rounded-full bg-red-50 text-red-700">
                                Rejected
                            </div>
                        )}

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
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ opacity: 0, maxHeight: 0 }}
                        animate={{ opacity: 1, maxHeight: 1000 }}
                        exit={{ opacity: 0, maxHeight: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-gray-100">
                            {order.items.map((item) => (
                                <OrderItem
                                    item={item}
                                    order={order}
                                    key={item.id}
                                    type="static"
                                />
                            ))}

                            <OrderTotal order={order} type="static" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

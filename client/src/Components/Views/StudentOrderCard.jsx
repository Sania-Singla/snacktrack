import { useState } from 'react';
import { motion } from 'framer-motion';
import { icons } from '../../Assets/icons';
import { formatTime } from '../../Utils';

export default function StudentOrderCard({ order, reference }) {
    const [expanded, setExpanded] = useState(false);
    const { amount, _id, createdAt, status, items, packingCharges } = order;

    return (
        <div
            ref={reference}
            className="bg-white rounded-lg shadow-sm overflow-hidden transition-all hover:shadow-md h-fit"
        >
            <div
                className="p-4 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex flex-row justify-between items-center w-full">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-sm font-medium text-gray-800 mb-1">
                            ORDER #{_id.slice(-8).toUpperCase()}
                        </h2>
                        <p className="text-xs text-gray-500">
                            {formatTime(createdAt)}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        {order.status === 'Pending' && (
                            <div className="w-fit px-2.5 pt-0.5 pb-1 text-xs font-medium rounded-full bg-yellow-50 text-yellow-700">
                                Pending
                            </div>
                        )}

                        {order.status === 'Prepared' && (
                            <div className="w-fit px-2.5 pt-0.5 pb-1 text-xs font-medium rounded-full bg-purple-50 text-purple-700">
                                Prepared
                            </div>
                        )}

                        {order.status === 'PickedUp' && (
                            <div className="fill-green-600 size-4 mr-2">
                                {icons.checkWithoutCircle}
                            </div>
                        )}

                        {order.status === 'Rejected' && (
                            <div className="w-fit px-2.5 pt-0.5 pb-1 text-xs font-medium rounded-full bg-red-50 text-red-700">
                                Rejected
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <span className="text-[17px] font-semibold text-gray-900">
                                ₹{amount.toFixed(2)}
                            </span>
                            <div className="flex items-center gap-4">
                                <div
                                    className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
                                >
                                    <div className="size-[11px] fill-gray-500">
                                        {icons.arrowDown}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {expanded && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="border-t border-gray-100"
                >
                    <div>
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className={`relative p-3 ${
                                    (order.status === 'Pending' ||
                                        order.status === 'Prepared') &&
                                    item.pickedUp
                                        ? 'opacity-60 border-none'
                                        : 'border-b-1 border-b-gray-100'
                                }`}
                            >
                                {/* ✅ Complete: Show green tick */}
                                {(order.status === 'Pending' ||
                                    order.status === 'Prepared') &&
                                    item.pickedUp && (
                                        <div className="absolute inset-0 bg-[#caffdd] border-green-300 border-[0.01rem] flex items-center h-full w-full justify-center -z-10">
                                            <div className="fill-green-600 size-8 p-1">
                                                {icons.check}
                                            </div>
                                        </div>
                                    )}

                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 bg-gray-50 rounded-lg border-1 border-gray-300 overflow-hidden flex items-center justify-center">
                                            {item.type === 'Snack' ? (
                                                <img
                                                    src={item.image}
                                                    alt={`${item.name} image`}
                                                    className="object-cover size-full"
                                                />
                                            ) : (
                                                <div className="size-5 stroke-gray-300">
                                                    {icons.soda}
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-[2px] pb-[5px]">
                                            <h3 className="text-sm font-medium text-gray-800 flex gap-2 items-center">
                                                <span>{item.name}</span>
                                                {item.isPacked && (
                                                    <span className="flex items-center gap-1 text-[10px] bg-yellow-50 rounded-full font-medium border-[0.01rem] border-yellow-300 w-fit px-2 text-yellow-600">
                                                        Pack
                                                    </span>
                                                )}
                                            </h3>
                                            <p className="text-gray-600 text-xs">
                                                Qty: {item.quantity}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end justify-between gap-[5px]">
                                        <div className="text-sm font-semibold text-gray-900">
                                            ₹
                                            {(
                                                item.price * item.quantity
                                            ).toFixed(2)}
                                        </div>

                                        {order.status === 'Pending' &&
                                            item.prepared &&
                                            !item.pickedUp && (
                                                <span className="flex items-center gap-1 text-[10px] bg-green-50 rounded-full font-medium border-[0.01rem] border-green-300 w-fit px-2 text-green-600">
                                                    Ready
                                                </span>
                                            )}
                                    </div>
                                </div>

                                {item.specialInstructions && (
                                    <p className="ml-13 pt-1 italic text-xs text-red-600">
                                        <span className="font-medium">
                                            Note:{' '}
                                        </span>
                                        {item.specialInstructions}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="p-4 border-t border-gray-100">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal</span>
                            <span>₹{amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 mt-1">
                            <span>Packing Charges</span>
                            <span>₹{packingCharges.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-medium text-gray-900 mt-2">
                            <span>Total</span>
                            <span>₹{amount.toFixed(2)}</span>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

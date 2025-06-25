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
            className="bg-white rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md h-fit"
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
                        <span
                            className={`px-2 pt-[2px] pb-[3px] text-xs font-bold rounded-full ${
                                status === 'Pending'
                                    ? 'bg-yellow-50 text-yellow-700'
                                    : status === 'Rejected'
                                      ? 'bg-red-50 text-red-700'
                                      : status === 'Prepared'
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'bg-green-50 text-green-700'
                            }`}
                        >
                            {status}
                        </span>

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
                    className="border-t border-gray-200"
                >
                    <div className="">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className={`relative space-y-2 p-4 ${status === 'Pending' && (item.preparedCount === item.quantity || item.type === 'PackagedFood') ? 'opacity-55' : 'border-[0.01rem] border-transparent'}`}
                            >
                                {/* Overlay tick for prepared item */}
                                {status === 'Pending' &&
                                    (item.preparedCount === item.quantity ||
                                        item.type === 'PackagedFood') && (
                                        <div className="absolute inset-0 bg-[#caffdd] border-green-300 border-[0.01rem] flex items-center h-full w-full justify-center -z-10">
                                            <div className="fill-green-600 size-8 p-1">
                                                {icons.check}
                                            </div>
                                        </div>
                                    )}
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 bg-gray-100 rounded-lg border-[0.01rem] border-gray-400 overflow-hidden flex items-center justify-center">
                                            {item.type === 'Snack' ? (
                                                <img
                                                    src={item.image}
                                                    alt={`${item.name} image`}
                                                    className="object-cover size-full"
                                                />
                                            ) : (
                                                <div className="size-5 stroke-gray-800">
                                                    {icons.soda}
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-[2px] pb-1">
                                            <h3 className="text-sm font-medium text-gray-800 flex gap-2 items-center">
                                                <span>{item.name}</span>
                                                {item.isPacked && (
                                                    <span className="flex items-center gap-1 text-[10px] bg-yellow-50 rounded-full font-medium border-[0.01rem] border-yellow-300 w-fit px-2 text-yellow-600">
                                                        Pack
                                                    </span>
                                                )}
                                            </h3>
                                            <div className="flex gap-1 items-center">
                                                <p className="text-gray-600 text-xs">
                                                    Qty: {item.quantity}
                                                </p>
                                                {item.preparedCount > 0 &&
                                                    item.preparedCount <
                                                        item.quantity && (
                                                        <div className="flex gap-1 items-center">
                                                            <span className="text-gray-400 text-xs">
                                                                &bull;
                                                            </span>
                                                            <p className="text-xs text-green-500">
                                                                Parepared:{' '}
                                                                {
                                                                    item.preparedCount
                                                                }
                                                            </p>
                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">
                                        ₹
                                        {(item.price * item.quantity).toFixed(
                                            2
                                        )}
                                    </span>
                                </div>

                                {item.specialInstructions && (
                                    <p className="ml-13 pl-1 italic text-xs text-gray-600">
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

import { icons } from '../../Assets/icons';
import { Button, OrderDropdown } from '..';
import { getRollNo, formatTime, checkTokenExpired } from '../../Utils';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../Services';
import { useSocketContext, useUserContext } from '../../Contexts';
import toast from 'react-hot-toast';
import { SOCKET_EVENTS } from '../../Constants/constants';

export default function ContractorOrderCard({ order, reference }) {
    const [expanded, setExpanded] = useState(false);
    const { amount, _id, createdAt, items, studentInfo, packingCharges } =
        order;
    const { socket } = useSocketContext();
    const { setUser } = useUserContext();
    const [statusOptions, setStatusOptions] = useState([]);

    useEffect(() => {
        if (order.status === 'Pending') {
            setStatusOptions([
                { value: '', label: 'Pending' },
                { value: 'Rejected', label: 'Rejected' },
            ]);
        } else {
            setStatusOptions([
                { value: '', label: 'Prepared' },
                { value: 'PickedUp', label: 'Picked Up' },
                { value: 'Rejected', label: 'Rejected' },
            ]);
        }
    }, [order]);

    const navigate = useNavigate();

    async function handleStatusChange(status) {
        try {
            const res = await orderService.updateOrderStatus({
                orderId: _id,
                status,
            });
            if (res && res.message === 'order status updated successfully') {
                socket.emit(
                    SOCKET_EVENTS[`ORDER_${status.toUpperCase()}`],
                    order
                );
            } else if (res && res.message === 'too late') {
                toast.error(
                    'You cannot change the status of this order anymore.'
                );
            } else checkTokenExpired(res, setUser);
        } catch (err) {
            navigate('/server-error');
        }
    }

    return (
        <div
            ref={reference}
            className="h-fit bg-white rounded-xl shadow-sm overflow-visible transition-all hover:shadow-md"
        >
            <div
                className="p-4 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex justify-between items-center mb-3 w-full">
                    {/* User Info Section */}
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full overflow-hidden shadow-sm">
                            <img
                                src={studentInfo.avatar}
                                alt={`${studentInfo.fullName} image`}
                                className="size-full object-cover"
                            />
                        </div>
                        <div className="flex-1 space-y-[2px]">
                            <h3 className="flex items-center gap-1">
                                <span className="font-medium text-sm text-gray-800 truncate">
                                    {studentInfo.fullName}
                                </span>
                                <span className="text-xs text-gray-600">•</span>
                                <span className="text-xs text-gray-600">
                                    Roll No: {getRollNo(studentInfo.userName)}
                                </span>
                            </h3>
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                                {studentInfo.phoneNumber}
                            </div>
                        </div>
                    </div>

                    {order.status === 'Pending' ||
                    order.status === 'Prepared' ? (
                        <div
                            className="w-fit"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <OrderDropdown
                                options={statusOptions}
                                onChange={handleStatusChange}
                            />
                        </div>
                    ) : (
                        <span
                            className={`px-2 pt-[2px] pb-[3px] text-xs font-bold rounded-full ${
                                order.status === 'Rejected'
                                    ? 'bg-red-50 text-red-700'
                                    : 'bg-green-50 text-green-700'
                            }`}
                        >
                            {order.status}
                        </span>
                    )}
                </div>

                <div className="flex flex-row justify-between items-center w-full">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-sm font-medium text-gray-800">
                            ORDER #{_id.slice(-8).toUpperCase()}
                        </h2>
                        <p className="text-xs text-gray-500">
                            {formatTime(createdAt)}
                        </p>
                    </div>
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

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ opacity: 0, maxHeight: 0 }}
                        animate={{
                            opacity: 1,
                            maxHeight: 1000, // Large enough to fit all content
                        }}
                        exit={{ opacity: 0, maxHeight: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-gray-100">
                            <div>
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`relative p-3 ${
                                            (order.status === 'Pending' ||
                                                order.status === 'Prepared') &&
                                            item.pickedUpCount === item.quantity
                                                ? 'opacity-60'
                                                : 'border-[0.01rem] border-transparent'
                                        }`}
                                    >
                                        {/* ✅ Complete: Show green tick */}
                                        {(order.status === 'Pending' ||
                                            order.status === 'Prepared') &&
                                            item.pickedUpCount ===
                                                item.quantity && (
                                                <div className="absolute inset-0 bg-[#caffdd] border-green-300 border-[0.01rem] flex items-center h-full w-full justify-center -z-10">
                                                    <div className="fill-green-600 size-8 p-1">
                                                        {icons.check}
                                                    </div>
                                                </div>
                                            )}

                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <div className="size-10 bg-gray-50 rounded-lg border-[0.01rem] border-gray-400 overflow-hidden flex items-center justify-center">
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
                                                        {order.status ===
                                                            'Pending' &&
                                                            item.preparedCount >
                                                                0 &&
                                                            item.pickedUpCount <
                                                                item.quantity && (
                                                                <span className="flex items-center gap-1 text-[10px] bg-green-50 rounded-full font-medium border-[0.01rem] border-green-300 w-fit px-2 text-green-600">
                                                                    {item.preparedCount ===
                                                                    item.quantity
                                                                        ? 'Prepared'
                                                                        : `Prepared - ${
                                                                              item.preparedCount
                                                                          }`}
                                                                </span>
                                                            )}
                                                        {(order.status ===
                                                            'Pending' ||
                                                            order.status ===
                                                                'Prepared') &&
                                                            item.pickedUpCount >
                                                                0 &&
                                                            item.pickedUpCount <
                                                                item.quantity && (
                                                                <span className="flex items-center gap-1 text-[10px] bg-blue-50 rounded-full font-medium border-[0.01rem] border-blue-300 w-fit px-2 text-blue-600">
                                                                    Taken -{' '}
                                                                    {
                                                                        item.pickedUpCount
                                                                    }
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
                                                        item.price *
                                                        item.quantity
                                                    ).toFixed(2)}
                                                </div>
                                                {(order.status === 'Pending' ||
                                                    order.status ===
                                                        'Prepared') &&
                                                    item.preparedCount > 0 &&
                                                    item.pickedUpCount <
                                                        item.quantity && (
                                                        <Button
                                                            btnText="Taken"
                                                            className="rounded-[5px] text-white bg-[#4977ec] hover:bg-[#3b62c2] text-[12px] font-medium text-center px-2 py-[2px]"
                                                            onClick={() =>
                                                                socket.emit(
                                                                    SOCKET_EVENTS.ITEM_PICKEDUP,
                                                                    {
                                                                        itemId: item.id,
                                                                        order,
                                                                        stuId: studentInfo._id,
                                                                    }
                                                                )
                                                            }
                                                        />
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
                                    <span>Packing</span>
                                    <span>₹{packingCharges.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between font-medium text-gray-900 mt-2">
                                    <span>Total</span>
                                    <span>₹{amount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

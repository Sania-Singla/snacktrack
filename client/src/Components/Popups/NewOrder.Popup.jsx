import { Button } from '..';
import { icons } from '../../Assets/icons';
import { useOrderContext, usePopupContext } from '../../Contexts';
import { useSocketContext } from '../../Contexts';
import { getRollNo } from '../../Utils';
import { orderService } from '../../Services';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { formatTime } from '../../Utils';
import { motion } from 'framer-motion';

export default function NewOrderPopup() {
    const { popupInfo, setShowPopup } = usePopupContext();
    const { socket } = useSocketContext();
    const [expanded, setExpanded] = useState(false);
    const { setPendingOrders } = useOrderContext();
    const navigate = useNavigate();

    async function handleAccept() {
        setPendingOrders((prev) => [...prev, popupInfo.order]);
        setShowPopup(false);
        socket.emit('orderAccepted', popupInfo.order);
    }

    async function handleReject() {
        try {
            const res = await orderService.updateOrderStatus(
                popupInfo.order._id,
                'Rejected'
            );
            if (res && res.message === 'order status updated successfully') {
                setShowPopup(false);
                socket.emit('orderRejected', popupInfo.order);
            }
        } catch (err) {
            navigate('/server-error');
        }
    }

    return (
        <div className="relative w-[350px] sm:w-[450px] transition-all duration-300 bg-white rounded-xl overflow-hidden text-black p-5 flex flex-col items-center justify-center gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible transition-all hover:shadow-md">
                <div
                    className="p-4 cursor-pointer"
                    onClick={() => setExpanded(!expanded)}
                >
                    <div className="flex justify-between items-center mb-3 w-full">
                        {/* User Info Section */}
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full overflow-hidden drop-shadow-sm">
                                <img
                                    src={popupInfo.order.studentInfo.avatar}
                                    alt={popupInfo.order.studentInfo.fullName}
                                    className="size-full object-cover"
                                />
                            </div>
                            <div className="flex-1 space-y-[2px]">
                                <h3 className="text-sm font-medium text-gray-800 truncate">
                                    {popupInfo.order.studentInfo.fullName}
                                </h3>
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                    <span>
                                        Roll No:{' '}
                                        {getRollNo(
                                            popupInfo.order.studentInfo.userName
                                        )}
                                    </span>
                                    <span>•</span>
                                    <span>
                                        {
                                            popupInfo.order.studentInfo
                                                .phoneNumber
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-row justify-between items-center w-full">
                        <div className="flex flex-col items-center gap-1">
                            <h2 className="text-sm font-medium text-gray-800">
                                ORDER #
                                {popupInfo.order._id.slice(-8).toUpperCase()}
                            </h2>
                            <p className="text-xs text-gray-500">
                                {formatTime(popupInfo.order.createdAt)}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[17px] font-semibold text-gray-900">
                                ₹{popupInfo.order.amount.toFixed(2)}
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

                {expanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="px-5 pb-5 border-t border-gray-100"
                    >
                        <div className="space-y-4 mt-4">
                            {popupInfo.order.items.map((item) => (
                                <div
                                    key={item._id}
                                    className="flex justify-between items-center"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <div className="size-5 text-gray-400">
                                                {item.itemType === 'Snack'
                                                    ? icons.snack
                                                    : icons.soda}
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-sm font-medium text-gray-800 capitalize">
                                                {item.name || item.category}
                                            </h3>
                                            <p className="text-xs text-gray-500">
                                                Qty: {item.quantity} • ₹
                                                {item.price.toFixed(2)} each
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">
                                        ₹
                                        {(item.price * item.quantity).toFixed(
                                            2
                                        )}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Subtotal</span>
                                <span>
                                    ₹{popupInfo.order.amount.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-600 mt-1">
                                <span>Packing</span>
                                <span>
                                    ₹{popupInfo.order.packingCharges.toFixed(2)}
                                </span>
                            </div>
                            <div className="flex justify-between font-medium text-gray-900 mt-2">
                                <span>Total</span>
                                <span>
                                    ₹{popupInfo.order.amount.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            <div className="flex items-center justify-center gap-4">
                <Button
                    btnText="Accept"
                    onClick={handleAccept}
                    className="text-white rounded-md py-2 h-[40px] flex items-center justify-center text-lg w-full bg-[#4977ec] hover:bg-[#3b62c2]"
                />
                <Button
                    btnText="Reject"
                    onClick={handleReject}
                    className="text-white rounded-md py-2 h-[40px] flex items-center justify-center text-lg w-full bg-[#4977ec] hover:bg-[#3b62c2]"
                />
            </div>
        </div>
    );
}

import { icons } from '../../Assets/icons';
import { OrderDropdown } from '..';
import { getRollNo } from '../../Utils';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../Services';

export default function ContractorOrderCard({ order, reference }) {
    const [expanded, setExpanded] = useState(false);
    const { amount, _id, createdAt, items, studentInfo } = order;
    const rollNo = getRollNo(studentInfo?.userName);
    const [statusOptions, setStatusOptions] = useState([
        { value: '', label: 'Pending' },
        { value: 'PickedUp', label: 'Picked Up' },
        { value: 'Prepared', label: 'Prepared' },
        { value: 'Rejected', label: 'Rejected' },
    ]);
    const [status, setStatus] = useState(order.status);
    const navigate = useNavigate();

    async function handleStatusChange(status) {
        try {
            const res = await orderService.updateOrderStatus(_id, status);
            if (res && res.message === 'order status updated successfully') {
                setStatus(status);
            }
        } catch (err) {
            navigate('/server-error');
        }
    }

    return (
        <motion.div
            ref={reference}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-visible transition-all hover:shadow-md"
        >
            <div
                className="p-4 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex justify-between items-center mb-3 w-full">
                    {/* User Info Section */}
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full overflow-hidden drop-shadow-sm">
                            <img
                                src={studentInfo?.avatar}
                                alt={studentInfo?.fullName}
                                className="size-full object-cover"
                            />
                        </div>
                        <div className="flex-1 space-y-[2px]">
                            <h3 className="text-sm font-medium text-gray-800 truncate">
                                {studentInfo?.fullName}
                            </h3>
                            <div className="flex items-center gap-1 text-xs text-gray-600">
                                <span>Roll No: {rollNo}</span>
                                <span>•</span>
                                <span>
                                    {studentInfo?.phoneNumber || 'No phone'}
                                </span>
                            </div>
                        </div>
                    </div>
                    {status === 'Pending' ? (
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
                                status === 'Rejected'
                                    ? 'bg-red-50 text-red-700'
                                    : 'bg-green-50 text-green-700'
                            }`}
                        >
                            {status}
                        </span>
                    )}
                </div>

                <div className="flex flex-row justify-between items-center w-full">
                    <div className="flex flex-col items-center gap-1">
                        <h2 className="text-sm font-medium text-gray-800">
                            ORDER #{_id.slice(-8).toUpperCase()}
                        </h2>
                        <p className="text-xs text-gray-500">
                            {new Date(createdAt).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
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

            {expanded && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="px-5 pb-5 border-t border-gray-100"
                >
                    <div className="space-y-4 mt-4">
                        {items.map((item) => (
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
                                    ₹{(item.price * item.quantity).toFixed(2)}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100">
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal</span>
                            <span>₹{amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 mt-1">
                            <span>Packing</span>
                            <span>₹0.00</span>
                        </div>
                        <div className="flex justify-between font-medium text-gray-900 mt-2">
                            <span>Total</span>
                            <span>₹{amount.toFixed(2)}</span>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
}

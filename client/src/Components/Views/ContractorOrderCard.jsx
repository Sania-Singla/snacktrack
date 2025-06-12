import { icons } from '../../Assets/icons';
import { OrderDropdown } from '..';
import { getRollNo, formatTime, checkTokenExpired } from '../../Utils';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../Services';
import { useSocketContext, useUserContext } from '../../Contexts';
import toast from 'react-hot-toast';

export default function ContractorOrderCard({ order, reference }) {
    const [expanded, setExpanded] = useState(false);
    const { amount, _id, createdAt, items, studentInfo, packingCharges } =
        order;
    const { socket } = useSocketContext();
    const [status, setStatus] = useState(order.status);
    const { setUser } = useUserContext();
    const [statusOptions, setStatusOptions] = useState([]);

    useEffect(() => setStatus(order.status), [order]);

    useEffect(() => {
        if (status === 'Pending') {
            setStatusOptions([
                { value: '', label: 'Pending' },
                { value: 'Prepared', label: 'Prepared' },
                { value: 'Rejected', label: 'Rejected' },
            ]);
        } else {
            setStatusOptions([
                { value: '', label: 'Prepared' },
                { value: 'PickedUp', label: 'Picked Up' },
                { value: 'Rejected', label: 'Rejected' },
            ]);
        }
    }, [status]);

    const navigate = useNavigate();

    async function handleStatusChange(status) {
        try {
            const res = await orderService.updateOrderStatus(_id, status);
            if (res && res.message === 'order status updated successfully') {
                setStatus(status);
                socket.emit(`order${status}`, order);
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
                        <div className="size-10 rounded-full overflow-hidden drop-shadow-sm">
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
                    {status === 'Pending' || status === 'Prepared' ? (
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
                        <div className="px-5 pb-5 border-t border-gray-100">
                            <div className="space-y-4 mt-4">
                                {items.map((item) => (
                                    <div key={item.id} className="space-y-2">
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
                                                <div>
                                                    <h3 className="text-sm font-medium text-gray-800 capitalize">
                                                        {item.name}
                                                    </h3>
                                                    <p className="text-xs text-gray-500">
                                                        Qty: {item.quantity} • ₹
                                                        {item.price.toFixed(2)}{' '}
                                                        each
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-gray-900">
                                                    ₹
                                                    {(
                                                        item.price *
                                                        item.quantity
                                                    ).toFixed(2)}
                                                </span>
                                                {item.isPacked && (
                                                    <div className="flex items-center gap-1 text-xs">
                                                        <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                                                        <span className="text-gray-500">
                                                            Pack
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {item.specialInstructions && (
                                            <div className="ml-13 pl-1">
                                                <p className="text-xs text-gray-600 italic">
                                                    <span className="font-medium not-italic">
                                                        Note:{' '}
                                                    </span>
                                                    {item.specialInstructions}
                                                </p>
                                            </div>
                                        )}
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

import { icons } from '../../Assets/icons';
import { Button, OrderItem, OrderStudentInfo, OrderTotal } from '..';
import { formatTime, checkTokenExpired } from '../../Utils';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { orderService } from '../../Services';
import { useUserContext } from '../../Contexts';
import toast from 'react-hot-toast';

export default function NewOrderCard({ order }) {
    const [expanded, setExpanded] = useState(false);
    const { amount, _id, createdAt, items, studentInfo, extraCharges } = order;
    const { setUser } = useUserContext();
    const [rejecting, setRejecting] = useState(false);
    const [accepting, setAccepting] = useState(false);

    async function reject() {
        try {
            setRejecting(true);
            const res = await orderService.updateOrderStatus({
                orderId: _id,
                status: 'Rejected',
            });

            if (res && res.message === 'order status updated successfully') {
                toast.success('Order Rejected');
            } else if (res && res.message === 'too late or not found') {
                toast.error('Too Late');
            } else checkTokenExpired(res, setUser);
        } catch (err) {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setRejecting(false);
        }
    }

    async function accept() {
        try {
            setAccepting(true);
            const res = await orderService.acceptOrder(_id);
            if (res && res.message === 'order accepted successfully') {
                toast.success('Order accepted');
            } else checkTokenExpired(res, setUser);
        } catch (err) {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setAccepting(false);
        }
    }

    return (
        <div className="h-fit w-full bg-white rounded-md shadow-xs border-1 border-gray-100 overflow-visible transition-all hover:shadow-sm">
            <div
                className="p-3 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="mb-2">
                    <OrderStudentInfo studentInfo={studentInfo} />
                </div>

                <div className="flex flex-row justify-between items-center w-full">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-[0.8rem] font-medium text-gray-800">
                            ORDER #{_id.slice(-8).toUpperCase()}
                        </h2>
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

                        <OrderTotal
                            order={order}
                            type="active"
                            rejecting={rejecting}
                        />

                        <div className="w-full p-3 flex items-center gap-4 justify-between border-t border-gray-100">
                            <Button
                                btnText="Accept"
                                disabled={accepting || rejecting}
                                className="w-15 h-7 border-1 border-green-400 text-green-600 flex items-center justify-center bg-green-100 hover:bg-green-100 rounded-md text-[0.8rem] font-medium"
                                onClick={accept}
                            />
                            <Button
                                btnText="Reject"
                                disabled={rejecting || accepting}
                                className="w-15 h-7 border-1 border-red-300 text-red-600 flex items-center justify-center bg-red-100 hover:bg-red-100 rounded-md text-[0.8rem] font-medium"
                                onClick={reject}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

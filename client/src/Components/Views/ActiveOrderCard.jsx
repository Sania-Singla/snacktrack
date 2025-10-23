import { icons } from '../../Assets/icons';
import { Button, OrderItem, OrderStudentInfo, OrderTotal } from '..';
import { formatTime, checkTokenExpired } from '../../Utils';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { orderService } from '../../Services';
import { useUserContext } from '../../Contexts';
import toast from 'react-hot-toast';

export default function ActiveOrderCard({ order, reference }) {
    const [expanded, setExpanded] = useState(false);
    const { amount, _id, createdAt, items, studentInfo, extraCharges } = order;
    const { setUser } = useUserContext();
    const [loading, setLoading] = useState(false);
    const [rejecting, setRejecting] = useState(false);

    async function handleStatusChange(status) {
        try {
            if (!status) return;
            if (status === 'Prepared') setLoading(true);
            else if (status === 'Rejected') setRejecting(true);

            const res = await orderService.updateOrderStatus({
                orderId: _id,
                status,
            });

            if (res && res.message === 'order status updated successfully') {
                // do nothing
            } else if (res && res.message === 'too late') {
                toast.error('Too Late');
            } else checkTokenExpired(res, setUser);
        } catch (err) {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
            setRejecting(false);
        }
    }

    return (
        <div
            ref={reference}
            className="h-fit w-full bg-white rounded-md shadow-xs border-1 border-gray-100 overflow-visible transition-all hover:shadow-sm"
        >
            <div
                className="p-3 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex justify-between items-center mb-2 w-full">
                    <OrderStudentInfo studentInfo={studentInfo} />

                    {/* {order.status === 'Pending' && (
                        <Button
                            btnText="Ready"
                            className="rounded-sm text-white bg-green-600 hover:bg-green-700 text-xs font-medium text-center px-2.5 py-1 mb-0.5"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange('Prepared');
                            }}
                        />
                    )} */}

                    {order.status === 'Prepared' && (
                        <Button
                            btnText="Taken"
                            className="rounded-sm text-white bg-[#4977ec] hover:bg-[#3b62c2] text-xs font-medium text-center px-2.5 py-1 mb-0.5"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange('PickedUp');
                            }}
                        />
                    )}

                    {order.status === 'PickedUp' && (
                        <div className="fill-green-600 size-4 m-1">
                            {icons.checkWithoutCircle}
                        </div>
                    )}

                    {order.status === 'Rejected' && (
                        <span className="px-2.5 pt-0.5 pb-1 text-xs font-medium rounded-full bg-red-50 text-red-700">
                            Rejected
                        </span>
                    )}
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
                                type="active"
                            />
                        ))}

                        <OrderTotal
                            order={order}
                            type="active"
                            rejecting={rejecting}
                        />

                        <div className="w-full p-3 flex items-center justify-start border-t border-gray-100">
                            <Button
                                btnText={
                                    rejecting ? (
                                        <div className="size-4 fill-red-800 dark:text-[#e95555]">
                                            {icons.loading}
                                        </div>
                                    ) : (
                                        'Reject'
                                    )
                                }
                                disabled={loading || rejecting}
                                className="w-15 h-7 border-1 border-red-100 text-red-600 flex items-center justify-center bg-red-50 hover:bg-red-100 rounded-md text-[0.8rem] font-medium"
                                onClick={() => handleStatusChange('Rejected')}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

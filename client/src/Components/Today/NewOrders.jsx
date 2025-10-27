import { useEffect, useState } from 'react';
import { AudioBtn, NewOrderCard } from '..';
import { useSocketContext, useUserContext } from '../../Contexts';
import { checkTokenExpired, playSound } from '../../Utils';
import toast from 'react-hot-toast';
import { orderService } from '../../Services';
import { SOCKET_EVENTS } from '../../Constants';

export default function NewOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, setUser } = useUserContext();
    const { socket } = useSocketContext();

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        (async function () {
            try {
                setLoading(true);
                const res = await orderService.getNewOrders({
                    canteenId: user.canteenId,
                    signal,
                });

                if (res && !res.message) {
                    setOrders(res.orders);
                } else checkTokenExpired(res, setUser);
            } catch (err) {
                toast.error('Something went wrong. Please try again.');
            } finally {
                setLoading(false);
            }
        })();

        return () => controller.abort();
    }, []);

    // Socket event listeners
    useEffect(() => {
        if (!socket) return;

        async function newOrder(o) {
            setOrders((prev) => [o, ...prev]);
            await playSound();
        }

        function orderPending(o) {
            const orderId = o._id;
            setOrders((prev) => prev.filter((o) => o._id !== orderId));
        }

        function orderPrepared({ orderId, order }) {
            setOrders((prev) => prev.filter((o) => o._id !== orderId));
        }

        function orderRejected(orderId) {
            setOrders((prev) => prev.filter((o) => o._id !== orderId));
        }

        function extraChargeUpdated({ orderId, extraCharges }) {
            setOrders((prev) =>
                prev.map((o) =>
                    o._id === orderId ? { ...o, extraCharges } : o
                )
            );
        }

        socket.on(SOCKET_EVENTS.ORDER_PENDING, orderPending);
        socket.on(SOCKET_EVENTS.ORDER_PREPARED, orderPrepared);
        socket.on(SOCKET_EVENTS.NEW_ORDER, newOrder);
        socket.on(SOCKET_EVENTS.ORDER_REJECTED, orderRejected);
        socket.on(SOCKET_EVENTS.EXTRA_CHARGES_UPDATED, extraChargeUpdated);

        return () => {
            socket.off(SOCKET_EVENTS.ORDER_PENDING, orderPending);
            socket.off(SOCKET_EVENTS.ORDER_PREPARED, orderPrepared);
            socket.off(SOCKET_EVENTS.NEW_ORDER, newOrder);
            socket.off(SOCKET_EVENTS.ORDER_REJECTED, orderRejected);
            socket.off(SOCKET_EVENTS.EXTRA_CHARGES_UPDATED, extraChargeUpdated);
        };
    }, [socket]);

    return (
        !loading && (
            <div>
                <div className="flex justify-between gap-4 items-center mb-5">
                    <h2 className="text-xl font-semibold text-gray-800">
                        New Orders
                    </h2>
                    <AudioBtn />
                </div>
                {orders.length === 0 ? (
                    <p className="text-gray-400 text-center italic">
                        No new orders
                    </p>
                ) : (
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
                        {orders.map((o) => (
                            <NewOrderCard order={o} key={o._id} />
                        ))}
                    </div>
                )}
            </div>
        )
    );
}

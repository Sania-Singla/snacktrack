import { useEffect, useState } from 'react';
import { ActiveOrderCard } from '..';
import {
    useSearchContext,
    useSocketContext,
    useUserContext,
} from '../../Contexts';
import { checkTokenExpired, paginate, playSound } from '../../Utils';
import { icons } from '../../Assets/icons';
import toast from 'react-hot-toast';
import { orderService } from '../../Services';
import { SOCKET_EVENTS } from '../../Constants';

export default function Pending() {
    const [orders, setOrders] = useState([]);
    const [ordersInfo, setOrdersInfo] = useState({});
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const { debouncedSearch } = useSearchContext();
    const { user, setUser } = useUserContext();
    const { socket } = useSocketContext();

    const paginateRef = paginate(ordersInfo?.hasNextPage, loading, setPage);

    useEffect(() => {
        setOrders([]);
        setPage(1);
    }, [debouncedSearch]);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        (async function () {
            try {
                setLoading(true);

                const res = await orderService.getCanteenOrders({
                    status: 'Pending',
                    date: null,
                    search: debouncedSearch,
                    canteenId: user.canteenId,
                    page,
                    signal,
                });

                if (res && !res.message) {
                    setOrdersInfo(res.ordersInfo);

                    if (page === 1) {
                        setOrders(res.orders);
                    } else {
                        // avoid duplicates
                        setOrders((prev) => {
                            const newOrders = res.orders.filter(
                                (newOrder) =>
                                    !prev.some(
                                        (existingOrder) =>
                                            existingOrder._id === newOrder._id
                                    )
                            );
                            return prev.concat(newOrders);
                        });
                    }
                } else checkTokenExpired(res, setUser);
            } catch (err) {
                toast.error('Something went wrong. Please try again.');
            } finally {
                setLoading(false);
            }
        })();

        return () => controller.abort();
    }, [page, debouncedSearch]);

    // Socket event listeners
    useEffect(() => {
        if (!socket) return;

        async function newOrder(o) {
            // !!⚠️⚠️⚠️⚠️⚠️⚠️!!!!!!!!!!!!!!!!!!!!!!!!! show popup

            setOrders((prev) => [...prev, o]); // append at end
            await playSound();
        }

        function orderPrepared(orderId) {
            setOrders((prev) =>
                prev.map((o) =>
                    o._id === orderId ? { ...o, status: 'Prepared' } : o
                )
            );
        }

        function orderPickedUp(orderId) {
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

        // we dont have per item updates yet ✨✨

        // function itemPrepared({ orderId, itemId }) {
        //     setOrders((prev) =>
        //         prev.map((o) => {
        //             if (o._id !== orderId) return o;

        //             const updatedItems = o.items.map((i) =>
        //                 i.id === itemId ? { ...i, prepared: true } : i
        //             );

        //             return { ...o, items: updatedItems };
        //         })
        //     );
        // }

        // function itemPickedUp({ orderId, itemId }) {
        //     setOrders((prev) => {
        //         const updatedOrders = prev
        //             .map((o) =>
        //                 o._id === orderId
        //                     ? {
        //                           ...o,
        //                           items: o.items.map((i) =>
        //                               i.id === itemId
        //                                   ? { ...i, pickedUp: true }
        //                                   : i
        //                           ),
        //                       }
        //                     : o
        //             )
        //             .filter((o) => o.items.some((i) => !i.pickedUp));

        //         const removed = !updatedOrders.some((o) => o._id === orderId);

        //         if (removed) {
        //             // fire and forget
        //             orderService
        //                 .updateOrderStatus({
        //                     orderId,
        //                     status: 'PickedUp',
        //                 })
        //                 .catch((err) =>
        //                     toast.error(
        //                         'Something went wrong. Please try again.'
        //                     )
        //                 );
        //         }

        //         return updatedOrders;
        //     });
        // }

        socket.on(SOCKET_EVENTS.NEW_ORDER, newOrder);
        socket.on(SOCKET_EVENTS.ORDER_PREPARED, orderPrepared);
        socket.on(SOCKET_EVENTS.ORDER_PICKEDUP, orderPickedUp);
        socket.on(SOCKET_EVENTS.ORDER_REJECTED, orderRejected);
        // socket.on(SOCKET_EVENTS.ITEM_PREPARED, itemPrepared);
        // socket.on(SOCKET_EVENTS.ITEM_PICKEDUP, itemPickedUp);
        socket.on(SOCKET_EVENTS.EXTRA_CHARGES_UPDATED, extraChargeUpdated);

        return () => {
            socket.off(SOCKET_EVENTS.NEW_ORDER, newOrder);
            socket.off(SOCKET_EVENTS.ORDER_PREPARED, orderPrepared);
            socket.off(SOCKET_EVENTS.ORDER_PICKEDUP, orderPickedUp);
            socket.off(SOCKET_EVENTS.ORDER_REJECTED, orderRejected);
            // socket.off(SOCKET_EVENTS.ITEM_PREPARED, itemPrepared);
            // socket.off(SOCKET_EVENTS.ITEM_PICKEDUP, itemPickedUp);
            socket.off(SOCKET_EVENTS.EXTRA_CHARGES_UPDATED, extraChargeUpdated);
        };
    }, [socket]);

    return (
        <>
            {orders.length > 0 && (
                <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
                    {orders.map((order, i) => (
                        <ActiveOrderCard
                            order={order}
                            key={order._id}
                            reference={
                                i + 1 === orders.length ? paginateRef : null
                            }
                        />
                    ))}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="size-6 fill-[#4977ec] dark:text-[#a2bdff]">
                        {icons.loading}
                    </div>
                </div>
            ) : (
                orders.length === 0 && (
                    <div className="italic text-gray-600 text-center">
                        No orders found
                    </div>
                )
            )}
        </>
    );
}

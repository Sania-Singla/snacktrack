import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useLayoutEffect, useState } from 'react';
import { orderService } from '../Services';
import {
    useUserContext,
    useSocketContext,
    useSearchContext,
    useOrderContext,
} from '../Contexts';
import { icons } from '../Assets/icons';
import { CalendarFilter, DateBadge, StudentOrderCard } from '../Components';
import { paginate, checkTokenExpired } from '../Utils';
import { SOCKET_EVENTS } from '../Constants';
import toast from 'react-hot-toast';

export default function StudentOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [ordersInfo, setOrdersInfo] = useState({});
    const [loading, setLoading] = useState(true);
    const { studentId } = useParams();
    const [page, setPage] = useState(1);
    const { user, setUser } = useUserContext();
    const { debouncedSearch } = useSearchContext();
    const { dateFilter } = useOrderContext();
    const { socket } = useSocketContext();
    const navigate = useNavigate();

    const paginateRef = paginate(ordersInfo?.hasNextPage, loading, setPage);

    useLayoutEffect(() => {
        if (studentId && user._id !== studentId) {
            navigate('/not-found');
        }
    }, []);

    useEffect(() => {
        setPage(1);
    }, [dateFilter, studentId, debouncedSearch]);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        (async function () {
            try {
                setLoading(true);
                const res = await orderService.getStudentOrders({
                    studentId,
                    date: dateFilter,
                    page,
                    search: debouncedSearch,
                    signal,
                });

                if (res && !res.message) {
                    if (page === 1) {
                        setOrders(res.orders);
                    } else {
                        setOrders((prev) => prev.concat(res.orders));
                    }
                    setOrdersInfo(res.ordersInfo);
                } else checkTokenExpired(res, setUser);
            } catch (err) {
                toast.error('Something went wrong. Please try again.');
            } finally {
                setLoading(false);
            }
        })();

        return () => controller.abort();
    }, [page, dateFilter, debouncedSearch, studentId]);

    // socket event listeners
    useEffect(() => {
        if (!socket) return;

        function helper(id, data) {
            setOrders((prev) =>
                prev.map((o) => (o._id === id ? { ...o, ...data } : o))
            );
        }

        socket.on(SOCKET_EVENTS.ORDER_REJECTED, (orderId) => {
            helper(orderId, { status: 'Rejected' });
        });

        socket.on(SOCKET_EVENTS.ORDER_PICKEDUP, (orderId) => {
            helper(orderId, { status: 'PickedUp' });
        });

        socket.on(SOCKET_EVENTS.ORDER_PREPARED, (orderId) => {
            helper(orderId, { status: 'Prepared' });
        });

        socket.on(
            SOCKET_EVENTS.EXTRA_CHARGES_UPDATED,
            ({ orderId, extraCharges }) => {
                helper(orderId, { extraCharges });
            }
        );

        // we dont have per item updates yet ✨✨

        // socket.on(SOCKET_EVENTS.ITEM_PREPARED, async ({ orderId, itemId }) => {
        //     setOrders((prev) => {
        //         const updatedOrders = prev.map((o) => {
        //             if (o._id !== orderId) return o;

        //             const updatedItems = o.items.map((i) =>
        //                 i.id === itemId ? { ...i, prepared: true } : i
        //             );

        //             const allPrepared = updatedItems.every((i) => i.prepared);
        //             return {
        //                 ...o,
        //                 items: updatedItems,
        //                 status: allPrepared ? 'Prepared' : o.status,
        //             };
        //         });

        //         return updatedOrders;
        //     });
        // });

        // socket.on(SOCKET_EVENTS.ITEM_PICKEDUP, ({ orderId, itemId }) => {
        //     setOrders((prev) => {
        //         const updatedOrders = prev.map((o) => {
        //             if (o._id !== orderId) return o;

        //             const updatedItems = o.items.map((i) =>
        //                 i.id === itemId ? { ...i, pickedUp: true } : i
        //             );

        //             const allPickedUp = updatedItems.every((i) => i.pickedUp);
        //             return {
        //                 ...o,
        //                 items: updatedItems,
        //                 status: allPickedUp ? 'PickedUp' : o.status,
        //             };
        //         });

        //         return updatedOrders;
        //     });
        // });

        return () => {
            socket.off(SOCKET_EVENTS.ORDER_REJECTED);
            socket.off(SOCKET_EVENTS.ORDER_PREPARED);
            socket.off(SOCKET_EVENTS.ORDER_PICKEDUP);
            // socket.off(SOCKET_EVENTS.ITEM_PREPARED);
            // socket.off(SOCKET_EVENTS.ITEM_PICKEDUP);
            socket.off(SOCKET_EVENTS.EXTRA_CHARGES_UPDATED);
        };
    }, [socket]);

    return (
        <div className="pl-2">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-6 mb-8">
                <div className="flex gap-4 justify-between items-center w-full">
                    <h1 className="text-xl text-nowrap font-semibold w-full sm:w-fit text-gray-900 flex items-center gap-4">
                        <p>{user._id === studentId ? 'My Orders' : 'Orders'}</p>
                        <DateBadge />
                    </h1>

                    <div className="text-nowrap sm:hidden text-center border-1 border-gray-200 rounded-md px-2 py-1 bg-white text-sm text-[#4977ec] font-medium">
                        Total Orders: {ordersInfo.totalOrders}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <CalendarFilter />
                    <div className="hidden text-nowrap sm:block text-center border-1 border-gray-200 rounded-md px-2 py-1 bg-white text-sm text-[#4977ec] font-medium">
                        Total Orders: {ordersInfo.totalOrders}
                    </div>
                </div>
            </div>

            {orders.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {orders.map((order, i) => (
                        <StudentOrderCard
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
                    <div className="size-[25px] fill-[#4977ec] dark:text-[#a2bdff]">
                        {icons.loading}
                    </div>
                </div>
            ) : (
                orders.length === 0 && (
                    <p className="flex items-center justify-center italic text-gray-500 my-10">
                        No orders found
                    </p>
                )
            )}
        </div>
    );
}

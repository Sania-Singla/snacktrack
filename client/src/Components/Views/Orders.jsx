import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { checkTokenExpired, paginate } from '../../Utils';
import { orderService } from '../../Services';
import { icons } from '../../Assets/icons';
import { ContractorOrderCard } from '..';
import {
    useSearchContext,
    useSocketContext,
    useUserContext,
} from '../../Contexts';

export default function Orders() {
    const [searchParams] = useSearchParams();
    const [orders, setOrders] = useState([]);
    const [ordersInfo, setOrdersInfo] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const { search } = useSearchContext();
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const { socket } = useSocketContext();
    const { user, setUser } = useUserContext();
    const dateFilter = searchParams.get('date') || undefined; // could be null or e.g., '2025-06-05'
    const statusFilter = searchParams.get('status');

    const paginateRef = paginate(ordersInfo?.hasNextPage, loading, setPage);

    // Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(handler);
    }, [search]);

    // Extracted reusable fetch function
    const fetchCanteenOrders = async ({ pageNum, signal }) => {
        try {
            setLoading(true);
            const res = await orderService.getCanteenOrders({
                status: statusFilter,
                canteenId: user.canteenId,
                date: dateFilter || undefined,
                page: pageNum,
                signal,
                search: debouncedSearch,
            });

            if (res && !res.message) {
                if (pageNum === 1) {
                    setOrders(res.orders);
                } else {
                    setOrders((prev) => prev.concat(res.orders));
                }
                setOrdersInfo(res.ordersInfo);
            } else checkTokenExpired(res, setUser);
        } catch (err) {
            navigate('/server-error');
        } finally {
            setLoading(false);
        }
    };

    // Fetch when filters change (initial + new filters)
    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        setOrders([]);
        setPage(1);
        fetchCanteenOrders({ pageNum: 1, signal });

        return () => controller.abort();
    }, [dateFilter, statusFilter, debouncedSearch]);

    // Fetch on page change (pagination)
    useEffect(() => {
        if (page === 1) return;
        const controller = new AbortController();
        const signal = controller.signal;

        fetchCanteenOrders({ pageNum: page, signal });

        return () => controller.abort();
    }, [page, debouncedSearch]);

    useEffect(() => {
        if (!socket) return;

        socket.on('newOrder', (order) => {
            if (statusFilter === 'Prepared') {
                const hasSnacks = order.items.some(
                    (item) => item.type === 'Snacks'
                );
                if (!hasSnacks) setOrders((prev) => [...prev, order]);
            }
        });

        socket.on('orderRejected', (order) => {
            if (statusFilter === 'Prepared') {
                setOrders((prev) => prev.filter((o) => o._id !== order._id));
            } else if (statusFilter === 'Rejected') {
                setOrders((prev) => [...prev, order]);
            }
        });

        socket.on('orderPrepared', (order) => {
            if (statusFilter === 'Prepared') {
                setOrders((prev) => [...prev, order]);
            }
        });

        socket.on('orderPickedUp', (order) => {
            if (statusFilter === 'Prepared') {
                setOrders((prev) => prev.filter((o) => o._id !== order._id));
            } else if (statusFilter === 'PickedUp') {
                setOrders((prev) => [...prev, order]);
            }
        });

        socket.on('itemPickedUp', ({ orderId, itemId }) => {
            if (statusFilter === 'Prepared') {
                setOrders((prev) => {
                    const originalOrder = prev.find((o) => o._id === orderId);
                    if (!originalOrder) return prev;

                    const updatedOrders = prev
                        .map((o) => {
                            if (o._id === orderId) {
                                return {
                                    ...o,
                                    items: o.items.map((i) =>
                                        i.id === itemId
                                            ? {
                                                  ...i,
                                                  pickedUpCount:
                                                      i.preparedCount,
                                              }
                                            : i
                                    ),
                                };
                            }
                            return o;
                        })
                        .filter((o) =>
                            // Keep orders where at least one item is not fully picked up
                            o.items.some((i) => i.pickedUpCount < i.quantity)
                        );

                    // Check if order was completely picked up
                    const orderWasRemoved = !updatedOrders.some(
                        (o) => o._id === orderId
                    );

                    if (orderWasRemoved) {
                        // IIFE to handle the async operation
                        (async () => {
                            try {
                                const res =
                                    await orderService.updateOrderStatus({
                                        orderId,
                                        status: 'PickedUp',
                                    });
                                if (
                                    res &&
                                    res.message ===
                                        'order status updated successfully'
                                ) {
                                    socket.emit('orderPickedUp', originalOrder);
                                }
                            } catch (error) {
                                console.error(
                                    'Failed to update order status:',
                                    error
                                );
                            }
                        })();
                    }

                    return updatedOrders;
                });
            }
        });

        return () => {
            socket.off('newOrder');
            socket.off('orderRejected');
            socket.off('orderPrepared');
            socket.off('orderPickedUp');
            socket.off('itemPickedUp');
        };
    }, [socket]);

    const orderElements = orders.map((order, i) => (
        <ContractorOrderCard
            order={order}
            key={order._id}
            reference={
                i + 1 === orders.length && ordersInfo?.hasNextPage
                    ? paginateRef
                    : null
            }
        />
    ));
    return (
        <div className="w-full">
            {orderElements.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {orderElements}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="size-[25px] fill-[#4977ec] dark:text-[#a2bdff]">
                        {icons.loading}
                    </div>
                </div>
            ) : (
                orderElements.length === 0 && (
                    <div className="italic text-gray-600">No orders found</div>
                )
            )}
        </div>
    );
}

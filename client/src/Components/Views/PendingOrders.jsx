import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { LIMIT } from '../../Constants/constants';
import { checkTokenExpired, paginate } from '../../Utils';
import { orderService } from '../../Services';
import { ContractorOrderCard } from '..';
import {
    useSocketContext,
    useSearchContext,
    useUserContext,
} from '../../Contexts';
import { icons } from '../../Assets/icons';

export default function PendingOrders() {
    const [searchParams] = useSearchParams();
    const [pendingOrders, setPendingOrders] = useState([]);
    const [ordersInfo, setOrdersInfo] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const { user, setUser } = useUserContext();
    const { search } = useSearchContext();
    const { socket } = useSocketContext();
    const dateFilter = searchParams.get('date'); // could be null or e.g., '2025-06-05'

    const paginateRef = paginate(ordersInfo?.hasNextPage, loading, setPage);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        (async function () {
            try {
                setLoading(true);
                setPendingOrders([]);
                setPage(1);

                const res = await orderService.getCanteenOrders(
                    'Pending',
                    user.canteenId,
                    dateFilter,
                    1,
                    LIMIT,
                    signal
                );
                if (res && !res.message) {
                    setPendingOrders(res.orders);
                    setOrdersInfo(res.ordersInfo);
                } else checkTokenExpired(res, setUser);
                setLoading(false);
            } catch (err) {
                navigate('/server-error');
            }
        })();

        return () => controller.abort();
    }, [dateFilter]);

    useEffect(() => {
        if (page === 1) return;

        const controller = new AbortController();
        const signal = controller.signal;

        (async function () {
            try {
                setLoading(true);

                const res = await orderService.getCanteenOrders(
                    'Pending',
                    user.canteenId,
                    dateFilter,
                    page,
                    LIMIT,
                    signal
                );
                if (res && !res.message) {
                    setPendingOrders((prev) => prev.concat(res.orders));
                    setOrdersInfo(res.ordersInfo);
                } else checkTokenExpired(res, setUser);
                setLoading(false);
            } catch (err) {
                navigate('/server-error');
            }
        })();

        return () => controller.abort();
    }, [page]);

    // socket event listeners
    useEffect(() => {
        if (!socket) return;

        socket.on('newOrder', async (order) => {
            setPendingOrders((prev) => {
                const exists = prev.find((o) => o._id === order._id);
                if (exists) return prev;
                else return [...prev, order];
            });
        });

        socket.on('orderRejected', (order) => {
            setPendingOrders((prev) => prev.filter((o) => o._id !== order._id));
        });

        socket.on('itemPrepared', ({ orderId, itemId }) => {
            setPendingOrders((prev) =>
                prev
                    .map((o) =>
                        o._id === orderId
                            ? {
                                  ...o,
                                  items: o.items.map((i) =>
                                      i.id === itemId
                                          ? {
                                                ...i,
                                                preparedCount:
                                                    i.preparedCount + 1,
                                            }
                                          : i
                                  ),
                              }
                            : o
                    )
                    .filter((o) =>
                        // Keep orders where at least one item is not fully prepared
                        o.items.some((i) => i.preparedCount < i.quantity)
                    )
            );
        });

        socket.on('itemPickedUp', ({ orderId, itemId }) => {
            setPendingOrders((prev) =>
                prev.map((o) =>
                    o._id === orderId
                        ? {
                              ...o,
                              items: o.items.map((i) =>
                                  i.id === itemId
                                      ? {
                                            ...i,
                                            pickedUpCount: i.preparedCount,
                                        }
                                      : i
                              ),
                          }
                        : o
                )
            );
        });

        return () => {
            socket.off('newOrder');
            socket.off('orderRejected');
            socket.off('itemPrepared');
            socket.off('itemPickedUp');
        };
    }, [socket]);

    const orderElements = pendingOrders
        .filter(
            (o) =>
                !search ||
                o.studentInfo.fullName
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                o.studentInfo.userName
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                o.items.some((item) =>
                    item.name?.toLowerCase().includes(search.toLowerCase())
                ) ||
                o._id.slice(-8).toLowerCase().includes(search.toLowerCase())
        )
        .map((order, i) => (
            <ContractorOrderCard
                order={order}
                key={order._id}
                reference={
                    i + 1 === pendingOrders.length && ordersInfo?.hasNextPage
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

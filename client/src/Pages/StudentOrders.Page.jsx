import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { orderService } from '../Services';
import {
    useUserContext,
    useSocketContext,
    useSearchContext,
} from '../Contexts';
import { icons } from '../Assets/icons';
import {
    Button,
    CalendarFilter,
    Filter,
    StudentOrderCard,
} from '../Components';
import { paginate, checkTokenExpired } from '../Utils';
import { SOCKET_EVENTS } from '../Constants/constants';
import toast from 'react-hot-toast';

export default function StudentOrdersPage() {
    const [studentOrders, setStudentOrders] = useState([]);
    const [ordersInfo, setOrdersInfo] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { studentId } = useParams();
    const [page, setPage] = useState(1);
    const { user, setUser } = useUserContext();
    const { search } = useSearchContext();
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const [searchParams] = useSearchParams();
    const monthFilter = searchParams.get('month') || new Date().getMonth() + 1;
    const dateFilter = searchParams.get('date') || undefined;
    const { socket } = useSocketContext();
    const paginateRef = paginate(ordersInfo?.hasNextPage, loading, setPage);

    // Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(handler);
    }, [search]);

    // Extracted reusable fetch function
    const fetchStudentOrders = async ({ pageNum, signal }) => {
        try {
            setLoading(true);
            const res = await orderService.getStudentOrders({
                studentId,
                month: monthFilter,
                date: dateFilter || undefined,
                page: pageNum,
                search: debouncedSearch,
                signal,
            });

            if (res && !res.message) {
                if (pageNum === 1) {
                    setStudentOrders(res.orders);
                } else {
                    setStudentOrders((prev) => prev.concat(res.orders));
                }
                setOrdersInfo(res.ordersInfo);
            } else checkTokenExpired(res, setUser);
        } catch (err) {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Fetch when filters change (initial + new filters)
    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        setStudentOrders([]);
        setPage(1);
        fetchStudentOrders({ pageNum: 1, signal });

        return () => controller.abort();
    }, [monthFilter, dateFilter, studentId, debouncedSearch]);

    // Fetch on page change (pagination)
    useEffect(() => {
        if (page === 1) return;
        const controller = new AbortController();
        const signal = controller.signal;

        fetchStudentOrders({ pageNum: page, signal });

        return () => controller.abort();
    }, [page, debouncedSearch, studentId]);

    // socket event listeners
    useEffect(() => {
        if (!socket) return;

        socket.on(SOCKET_EVENTS.ORDER_REJECTED, (order) => {
            setStudentOrders((prev) =>
                prev.map((o) =>
                    o._id === order._id ? { ...o, status: 'Rejected' } : o
                )
            );
        });

        socket.on(SOCKET_EVENTS.ORDER_PICKEDUP, (order) => {
            setStudentOrders((prev) =>
                prev.map((o) =>
                    o._id === order._id ? { ...o, status: 'PickedUp' } : o
                )
            );
        });

        socket.on(SOCKET_EVENTS.ORDER_PREPARED, (order) => {
            setStudentOrders((prev) =>
                prev.map((o) =>
                    o._id === order._id ? { ...o, status: 'Prepared' } : o
                )
            );
        });

        socket.on(
            SOCKET_EVENTS.EXTRA_CHARGES_UPDATED,
            ({ orderId, extraCharges }) => {
                setStudentOrders((prev) =>
                    prev.map((o) =>
                        o._id === orderId ? { ...o, extraCharges } : o
                    )
                );
            }
        );

        socket.on(
            SOCKET_EVENTS.ITEM_PREPARED,
            async ({ orderId, itemId, stuId }) => {
                if (stuId !== studentId) return;

                setStudentOrders((prev) => {
                    const updatedOrders = prev.map((o) => {
                        if (o._id !== orderId) return o;

                        const updatedItems = o.items.map((i) =>
                            i.id === itemId ? { ...i, prepared: true } : i
                        );

                        const allPrepared = updatedItems.every(
                            (i) => i.prepared
                        );
                        return {
                            ...o,
                            items: updatedItems,
                            status: allPrepared ? 'Prepared' : o.status,
                        };
                    });

                    return updatedOrders;
                });
            }
        );

        socket.on(SOCKET_EVENTS.ITEM_PICKEDUP, ({ orderId, itemId, stuId }) => {
            if (stuId !== studentId) return;

            setStudentOrders((prev) => {
                const updatedOrders = prev.map((o) => {
                    if (o._id !== orderId) return o;

                    const updatedItems = o.items.map((i) =>
                        i.id === itemId ? { ...i, pickedUp: true } : i
                    );

                    const allPickedUp = updatedItems.every((i) => i.pickedUp);
                    return {
                        ...o,
                        items: updatedItems,
                        status: allPickedUp ? 'PickedUp' : o.status,
                    };
                });

                return updatedOrders;
            });
        });

        return () => {
            socket.off(SOCKET_EVENTS.ORDER_REJECTED);
            socket.off(SOCKET_EVENTS.ORDER_PICKEDUP);
            socket.off(SOCKET_EVENTS.ITEM_PREPARED);
            socket.off(SOCKET_EVENTS.ITEM_PICKEDUP);
        };
    }, [socket]);

    return (
        <div className="w-full sm:p-4">
            <div className="flex sm:items-center flex-col sm:flex-row gap-5 justify-between mb-7">
                <h1 className="text-2xl font-semibold text-gray-900">
                    {user._id === studentId ? 'My Orders' : 'Orders'}
                </h1>
                <div className="flex items-center gap-4 justify-end">
                    <CalendarFilter month={monthFilter} />
                    <Filter
                        options={[
                            { value: 1, label: 'January' },
                            { value: 2, label: 'February' },
                            { value: 3, label: 'March' },
                            { value: 4, label: 'April' },
                            { value: 5, label: 'May' },
                            { value: 6, label: 'June' },
                            { value: 7, label: 'July' },
                            { value: 8, label: 'August' },
                            { value: 9, label: 'September' },
                            { value: 10, label: 'October' },
                            { value: 11, label: 'November' },
                            { value: 12, label: 'December' },
                        ]}
                        defaultOption={monthFilter}
                        queryParamName="month"
                    />
                </div>
            </div>

            {studentOrders.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {studentOrders.map((order, i) => (
                        <StudentOrderCard
                            order={order}
                            key={order._id}
                            reference={
                                i + 1 === studentOrders.length &&
                                ordersInfo?.hasNextPage
                                    ? paginateRef
                                    : null
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
                studentOrders.length === 0 && (
                    <div className="text-center py-16">
                        <div className="mx-auto size-20 text-gray-300 mb-4">
                            {icons.package}
                        </div>
                        <h3 className="text-xl font-medium text-gray-700 mb-2">
                            No orders yet
                        </h3>
                        <p className="text-gray-500 mb-5">
                            Your order history will appear here
                        </p>
                        {user._id === studentId && (
                            <Button
                                btnText="Order Now"
                                onClick={() => navigate('/')}
                                className="px-3 py-1.5 bg-[#4977ec] hover:bg-[#3b62c2] text-white rounded-md text-sm font-medium"
                            />
                        )}
                    </div>
                )
            )}
        </div>
    );
}

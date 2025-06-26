import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { orderService } from '../Services';
import { useUserContext, useSocketContext } from '../Contexts';
import { icons } from '../Assets/icons';
import {
    Button,
    CalendarFilter,
    Filter,
    StudentOrderCard,
} from '../Components';
import { paginate, checkTokenExpired } from '../Utils';
import { LIMIT } from '../Constants/constants';

export default function StudentOrdersPage() {
    const [studentOrders, setStudentOrders] = useState([]);
    const [ordersInfo, setOrdersInfo] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { studentId } = useParams();
    const [page, setPage] = useState(1);
    const { user, setUser } = useUserContext();
    const [searchParams, setSearchParams] = useSearchParams();
    const monthFilter = searchParams.get('month') || new Date().getMonth() + 1;
    let dateFilter = searchParams.get('date'); // could be null or e.g., '2025-06-05'
    const { socket } = useSocketContext();

    const months = [
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
    ];
    const paginateRef = paginate(ordersInfo?.hasNextPage, loading, setPage);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        (async function () {
            try {
                setLoading(true);
                setStudentOrders([]);
                setPage(1);

                // reset date filter if it exists
                if (searchParams.get('date')) {
                    searchParams.delete('date');
                    setSearchParams(searchParams);
                }
                const res = await orderService.getStudentOrders(
                    studentId,
                    monthFilter,
                    1,
                    LIMIT,
                    signal
                );
                if (res && !res.message) {
                    setStudentOrders(res.orders);
                    setOrdersInfo(res.ordersInfo);
                } else checkTokenExpired(res, setUser);
                setLoading(false);
            } catch (err) {
                navigate('/server-error');
            }
        })();

        return () => controller.abort();
    }, [monthFilter]);

    useEffect(() => {
        if (page === 1) return; // Already handled in filter use effect

        const controller = new AbortController();
        const signal = controller.signal;

        (async function () {
            try {
                setLoading(true);
                const res = await orderService.getStudentOrders(
                    studentId,
                    monthFilter,
                    page,
                    LIMIT,
                    signal
                );
                if (res && !res.message) {
                    setStudentOrders((prev) => prev.concat(res.orders));
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
            if (order.studentId === studentId) {
                setStudentOrders((prev) => [...prev, order]);
            }
        });

        socket.on('orderRejected', (order) => {
            if (order.studentId === studentId) {
                setStudentOrders((prev) =>
                    prev.map((o) =>
                        o._id === order._id ? { ...o, status: 'Rejected' } : o
                    )
                );
            }
        });

        socket.on('orderPickedUp', (order) => {
            if (order.studentId === studentId) {
                setStudentOrders((prev) =>
                    prev.map((o) =>
                        o._id === order._id ? { ...o, status: 'PickedUp' } : o
                    )
                );
            }
        });

        socket.on('itemPrepared', async ({ orderId, itemId, stuId }) => {
            if (stuId !== studentId) return;

            setStudentOrders((prev) => {
                const updatedOrders = prev.map((o) => {
                    if (o._id !== orderId) return o;

                    const updatedItems = o.items.map((i) =>
                        i.id === itemId
                            ? {
                                  ...i,
                                  preparedCount: i.preparedCount + 1,
                              }
                            : i
                    );

                    const allPrepared = updatedItems.every(
                        (i) => i.preparedCount === i.quantity
                    );
                    return {
                        ...o,
                        items: updatedItems,
                        status: allPrepared ? 'Prepared' : o.status,
                    };
                });

                return updatedOrders;
            });
        });
    }, [socket]);

    const filteredOrders = dateFilter
        ? studentOrders.filter((order) => {
              const orderDate = new Date(order.createdAt).toLocaleDateString(
                  'en-CA'
              ); // Format: 'YYYY-MM-DD'
              return orderDate === dateFilter;
          })
        : studentOrders;

    return (
        <div className="w-full sm:p-4">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    {user._id === studentId ? 'My Orders' : 'Orders'}
                </h1>
                <div className="flex items-center gap-4 justify-center">
                    <CalendarFilter month={monthFilter} />
                    <Filter
                        options={months}
                        defaultOption={monthFilter}
                        queryParamName="month"
                    />
                </div>
            </div>

            {filteredOrders.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredOrders.map((order, i) => (
                        <StudentOrderCard
                            order={order}
                            key={order._id}
                            reference={
                                i + 1 === filteredOrders.length &&
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
                filteredOrders.length === 0 && (
                    <div className="text-center py-16">
                        <div className="mx-auto size-20 text-gray-300 mb-4">
                            {icons.package}
                        </div>
                        <h3 className="text-xl font-medium text-gray-700 mb-2">
                            No orders yet
                        </h3>
                        <p className="text-gray-500 mb-6">
                            Your order history will appear here
                        </p>
                        {user._id === studentId && (
                            <Button
                                btnText="Order Now"
                                onClick={() => navigate('/')}
                                className="px-4 py-2 bg-[#4977ec] hover:bg-[#3b62c2] text-white rounded-lg font-medium"
                            />
                        )}
                    </div>
                )
            )}
        </div>
    );
}

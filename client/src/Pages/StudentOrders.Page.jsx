import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { orderService } from '../Services';
import { useUserContext, useOrderContext } from '../Contexts';
import { icons } from '../Assets/icons';
import { Button, Filter, StudentOrderCard } from '../Components';
import { paginate } from '../Utils';
import { LIMIT } from '../Constants/constants';

export default function StudentOrdersPage() {
    const { setStudentOrders, studentOrders } = useOrderContext();
    const [ordersInfo, setOrdersInfo] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { studentId } = useParams();
    const [page, setPage] = useState(1);
    const { user } = useUserContext();
    const [searchParams] = useSearchParams();
    const filter = searchParams.get('filter') || new Date().getMonth() + 1; // Default to current month
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
                const data = await orderService.getStudentOrders(
                    studentId,
                    filter,
                    page,
                    LIMIT,
                    signal
                );
                if (data && !data.message) {
                    setStudentOrders((prev) => prev.concat(data.orders));
                    setOrdersInfo(data.ordersInfo);
                }
            } catch (err) {
                navigate('/server-error');
            } finally {
                setLoading(false);
            }
        })();

        return () => controller.abort();
    }, [page, filter]);

    useEffect(() => {
        setStudentOrders([]), setPage(1);
    }, [filter]);

    return (
        <div className="w-full p-4">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    {user._id === studentId ? 'My Orders' : 'Orders'}
                </h1>
                <Filter options={months} defaultOption={filter} />
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

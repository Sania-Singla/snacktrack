import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LIMIT } from '../../Constants/constants';
import { paginate } from '../../Utils';
import { orderService } from '../../Services';
import { ContractorOrderCard } from '..';
import { useOrderContext } from '../../Contexts';
import { icons } from '../../Assets/icons';

export default function PendingOrders() {
    const { pendingOrders, setPendingOrders } = useOrderContext();
    const [ordersInfo, setOrdersInfo] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [page, setPage] = useState(1);

    const paginateRef = paginate(ordersInfo?.hasNextPage, loading, setPage);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        (async function getOrders() {
            try {
                setLoading(true);
                const res = await orderService.getCanteenOrders(
                    'Pending',
                    page,
                    LIMIT,
                    signal
                );
                if (res && !res.message) {
                    setPendingOrders(res.orders);
                    setOrdersInfo(res.ordersInfo);
                }
            } catch (err) {
                navigate('/server-error');
            } finally {
                setLoading(false);
            }
        })();

        return () => controller.abort();
    }, [page, navigate]);

    return (
        <div className="w-full p-4">
            {pendingOrders.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingOrders.map((order, i) => (
                        <ContractorOrderCard
                            order={order}
                            key={order._id}
                            reference={
                                i + 1 === pendingOrders.length &&
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
                pendingOrders.length === 0 && <div>No orders found</div>
            )}
        </div>
    );
}

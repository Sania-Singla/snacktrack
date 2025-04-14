import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LIMIT } from '../../Constants/constants';
import { paginate } from '../../Utils';
import { orderService } from '../../Services';
import { ContractorOrderCard } from '..';
import { useOrderContext, useSearchContext } from '../../Contexts';
import { icons } from '../../Assets/icons';

export default function PendingOrders({ filter }) {
    const { pendingOrders, setPendingOrders } = useOrderContext();
    const [ordersInfo, setOrdersInfo] = useState({});
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const { search } = useSearchContext();

    const paginateRef = paginate(ordersInfo?.hasNextPage, loading, setPage);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        (async function () {
            try {
                setLoading(true);
                const res = await orderService.getCanteenOrders(
                    'Pending',
                    page,
                    LIMIT,
                    signal
                );
                if (res && !res.message) {
                    setPendingOrders((prev) => prev.concat(res.orders));
                    setOrdersInfo(res.ordersInfo);
                }
            } catch (err) {
                navigate('/server-error');
            } finally {
                setLoading(false);
            }
        })();

        return () => controller.abort();
    }, [page]);

    useEffect(() => {
        setPendingOrders([]), setPage(1);
    }, [filter]);

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
                o.items.some(
                    (item) =>
                        item.name
                            ?.toLowerCase()
                            .includes(search.toLowerCase()) ||
                        item.category
                            ?.toLowerCase()
                            .includes(search.toLowerCase())
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
        <div className="w-full md:p-4">
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
                orderElements.length === 0 && <div>No orders found</div>
            )}
        </div>
    );
}

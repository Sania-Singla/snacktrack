import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LIMIT } from '../../Constants/constants';
import { checkTokenExpired, paginate } from '../../Utils';
import { orderService } from '../../Services';
import { icons } from '../../Assets/icons';
import { ContractorOrderCard } from '..';
import { useSearchContext, useUserContext } from '../../Contexts';

export default function Orders({ filter }) {
    const [orders, setOrders] = useState([]);
    const [ordersInfo, setOrdersInfo] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const { search } = useSearchContext();
    const { user, setUser } = useUserContext();

    const paginateRef = paginate(ordersInfo?.hasNextPage, loading, setPage);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        (async function () {
            try {
                setLoading(true);
                setOrders([]);
                setPage(1);
                const res = await orderService.getCanteenOrders(
                    filter,
                    user.canteenId,
                    1,
                    LIMIT,
                    signal
                );
                if (res && !res.message) {
                    setOrders(res.orders);
                    setOrdersInfo(res.ordersInfo);
                    setLoading(false);
                } else checkTokenExpired(res, setUser);
            } catch (err) {
                navigate('/server-error');
            }
        })();

        return () => controller.abort();
    }, [filter]);

    useEffect(() => {
        if (page === 1) return; // Already handled in filter use effect

        const controller = new AbortController();
        const signal = controller.signal;

        (async function () {
            try {
                setLoading(true);
                const res = await orderService.getCanteenOrders(
                    filter,
                    user.canteenId,
                    page,
                    LIMIT,
                    signal
                );
                if (res && !res.message) {
                    setOrders((prev) => prev.concat(res.orders));
                    setOrdersInfo(res.ordersInfo);
                    setLoading(false);
                } else checkTokenExpired(res, setUser);
            } catch (err) {
                navigate('/server-error');
            }
        })();

        return () => controller.abort();
    }, [page]);

    const orderElements = orders
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

import { useEffect, useState } from 'react';
import { StaticOrderCard } from '..';
import {
    useOrderContext,
    useSearchContext,
    useUserContext,
} from '../../Contexts';
import { checkTokenExpired, paginate } from '../../Utils';
import { icons } from '../../Assets/icons';
import toast from 'react-hot-toast';
import { orderService } from '../../Services';

export default function Rejected() {
    const [orders, setOrders] = useState([]);
    const [ordersInfo, setOrdersInfo] = useState({});
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const { debouncedSearch } = useSearchContext();
    const { user, setUser } = useUserContext();
    const { dateFilter } = useOrderContext();

    const paginateRef = paginate(ordersInfo?.hasNextPage, loading, setPage);

    useEffect(() => {
        setOrders([]);
        setPage(1);
    }, [dateFilter, debouncedSearch]);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        (async function () {
            try {
                setLoading(true);

                const res = await orderService.getCanteenOrders({
                    status: 'Rejected',
                    date: dateFilter,
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
                        setOrders((prev) => prev.concat(res.orders));
                    }
                } else checkTokenExpired(res, setUser);
            } catch (err) {
                toast.error('Something went wrong. Please try again.');
            } finally {
                setLoading(false);
            }
        })();

        return () => controller.abort();
    }, [page, dateFilter, debouncedSearch]);

    return (
        <>
            {orders.length > 0 && (
                <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
                    {orders.map((order, i) => (
                        <StaticOrderCard
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
                    <div className="italic text-gray-400 text-center">
                        No orders found
                    </div>
                )
            )}
        </>
    );
}

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { checkTokenExpired, paginate } from '../../Utils';
import { orderService } from '../../Services';
import { icons } from '../../Assets/icons';
import { ContractorOrderCard } from '..';
import { useSearchContext, useUserContext } from '../../Contexts';

export default function Orders({ orders, setOrders }) {
    const [searchParams] = useSearchParams();
    const [ordersInfo, setOrdersInfo] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const { search } = useSearchContext();
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const { user, setUser } = useUserContext();
    const dateFilter = searchParams.get('date') || undefined; // could be null or e.g., '2025-06-05'
    const statusFilter = searchParams.get('status');

    const paginateRef = paginate(ordersInfo?.hasNextPage, loading, setPage);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(handler);
    }, [search]);

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

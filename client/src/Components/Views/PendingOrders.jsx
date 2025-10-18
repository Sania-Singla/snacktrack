import { useEffect, useState } from 'react';
import {  useSearchParams } from 'react-router-dom';
import { checkTokenExpired, paginate } from '../../Utils';
import { orderService } from '../../Services';
import { ContractorOrderCard } from '..';
import { useSearchContext, useUserContext } from '../../Contexts';
import { icons } from '../../Assets/icons';
import toast from 'react-hot-toast';

export default function PendingOrders({ pendingOrders, setPendingOrders }) {
    const [searchParams] = useSearchParams();
    const [ordersInfo, setOrdersInfo] = useState({});
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const { user, setUser } = useUserContext();
    const { search } = useSearchContext();
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const dateFilter = searchParams.get('date') || undefined; // could be null or e.g., '2025-06-05'

    // pagination
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
                status: 'Pending', // both pending and prepared actually
                canteenId: user.canteenId,
                date: dateFilter || undefined,
                page: pageNum,
                signal,
                search: debouncedSearch,
            });

            if (res && !res.message) {
                if (pageNum === 1) {
                    setPendingOrders(res.orders);
                } else {
                    setPendingOrders((prev) => prev.concat(res.orders));
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

        setPendingOrders([]);
        setPage(1);
        fetchCanteenOrders({ pageNum: 1, signal });

        return () => controller.abort();
    }, [dateFilter, debouncedSearch]);

    // Fetch on page change (pagination)
    useEffect(() => {
        if (page === 1) return;
        const controller = new AbortController();
        const signal = controller.signal;

        fetchCanteenOrders({ pageNum: page, signal });

        return () => controller.abort();
    }, [page, debouncedSearch]);

    const orderElements = pendingOrders.map((order, i) => (
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
                    <div className="italic text-gray-600 text-center">
                        No orders found
                    </div>
                )
            )}
        </div>
    );
}

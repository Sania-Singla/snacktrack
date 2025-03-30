import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LIMIT } from '../../Constants/constants';
import { paginate } from '../../Utils';
import { orderService } from '../../Services';
import { motion } from 'framer-motion';
import { ContractorOrderCard } from '..';

export default function RejectedOrders() {
    const [orders, setOrders] = useState([]);
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
                    'Rejected',
                    page,
                    LIMIT,
                    signal
                );
                if (res && !res.message) {
                    setOrders(res.orders);
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

    return loading ? (
        <div>loading...</div>
    ) : orders.length > 0 ? (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
            {orders.map((order, i) => (
                <motion.div
                    key={order._id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <ContractorOrderCard
                        order={order}
                        reference={
                            i + 1 === orders.length && ordersInfo?.hasNextPage
                                ? paginateRef
                                : null
                        }
                    />
                </motion.div>
            ))}
        </motion.div>
    ) : (
        <div>No orders found</div>
    );
}

import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { orderService } from '../Services';
import { useUserContext } from '../Contexts';
import { motion } from 'framer-motion';
import { icons } from '../Assets/icons';
import { Button, StudentOrderCard } from '../Components';
import { paginate } from '../Utils';
import { LIMIT } from '../Constants/constants';

export default function MyOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [ordersInfo, setOrdersInfo] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useUserContext();
    const [page, setPage] = useState(1);

    const paginateRef = paginate(ordersInfo?.hasNextPage, loading, setPage);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        (async function getOrders() {
            try {
                const data = await orderService.getStudentOrders(
                    user._id,
                    signal,
                    page,
                    LIMIT
                );
                if (data && !data.message) {
                    setOrders(data.orders);
                    setOrdersInfo(data.ordersInfo);
                }
            } catch (err) {
                navigate('/server-error');
            } finally {
                setLoading(false);
            }
        })();

        return () => controller.abort();
    }, []);

    return (
        <div className="w-full p-4">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                {orders.length > 0 && (
                    <Button
                        btnText={
                            <div className="flex items-center gap-2">
                                <span>Order Again</span>
                                <div className="size-4 fill-[#4977ec] group-hover:fill-[#3b62c2]">
                                    {icons.rightArrow}
                                </div>
                            </div>
                        }
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 group font-medium text-[#4977ec] hover:text-[#3b62c2]"
                    />
                )}
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="size-[25px] fill-[#4977ec] dark:text-[#a2bdff]">
                        {icons.loading}
                    </div>
                </div>
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
                            <StudentOrderCard
                                order={order}
                                reference={
                                    i + 1 === orders.length &&
                                    ordersInfo?.hasNextPage
                                        ? paginateRef
                                        : null
                                }
                            />
                        </motion.div>
                    ))}
                </motion.div>
            ) : (
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
                    <Button
                        btnText="Order Now"
                        onClick={() => navigate('/')}
                        className="px-4 py-2 bg-[#4977ec] hover:bg-[#3b62c2] text-white rounded-lg font-medium"
                    />
                </div>
            )}
        </div>
    );
}

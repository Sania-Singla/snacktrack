import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { orderService } from '../../Services';
import {
    useUserContext,
    useOrderContext,
    useSocketContext,
} from '../../Contexts';
import { SOCKET_EVENTS } from '../../Constants';

export default function Stats() {
    const { stats, setStats, statusFilter, setStatusFilter, dateFilter } =
        useOrderContext();
    const [loading, setLoading] = useState(true);
    const { user } = useUserContext();
    const { socket } = useSocketContext();

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        (async function () {
            try {
                setLoading(true);
                const res = await orderService.getOrderStats({
                    canteenId: user.canteenId,
                    date: dateFilter,
                    signal,
                });
                if (res && !res.message) setStats(res);
            } catch (err) {
                toast.error('Something went wrong. Please try again.');
            } finally {
                setLoading(false);
            }
        })();

        return () => controller.abort();
    }, [dateFilter]);

    useEffect(() => {
        if (!socket) return;

        async function newOrder() {
            setStats((prev) => ({
                ...prev,
                Total: prev.Total + 1,
                Pending: prev.Pending + 1,
            }));
        }

        function orderPickedUp() {
            setStats((prev) => ({
                ...prev,
                Pending: prev.Pending - 1,
                PickedUp: prev.PickedUp + 1,
            }));
        }

        function orderRejected() {
            setStats((prev) => ({
                ...prev,
                Pending: prev.Pending - 1,
                Rejected: prev.Rejected + 1,
            }));
        }

        socket.on(SOCKET_EVENTS.NEW_ORDER, newOrder);
        socket.on(SOCKET_EVENTS.ORDER_PICKEDUP, orderPickedUp);
        socket.on(SOCKET_EVENTS.ORDER_REJECTED, orderRejected);

        return () => {
            socket.off(SOCKET_EVENTS.NEW_ORDER, newOrder);
            socket.off(SOCKET_EVENTS.ORDER_PICKEDUP, orderPickedUp);
            socket.off(SOCKET_EVENTS.ORDER_REJECTED, orderRejected);
        };
    }, [socket]);

    return (
        !loading && (
            <div className="flex gap-4 items-center justify-center w-full">
                <div
                    onClick={() => setStatusFilter('Pending')}
                    className={`bg-white w-full py-1 space-y-1.5 text-center text-sm cursor-pointer hover:border-blue-500 rounded-md border ${statusFilter === 'Pending' ? 'border-blue-500' : 'border-gray-200'}`}
                >
                    <h3 className="font-medium text-gray-800">Pending</h3>
                    <span className="text-blue-600 font-bold">
                        {stats.Pending}
                    </span>
                </div>

                <div
                    onClick={() => setStatusFilter('PickedUp')}
                    className={`bg-white w-full py-1 space-y-1.5 text-center text-sm cursor-pointer hover:border-green-500 rounded-md border ${statusFilter === 'PickedUp' ? 'border-green-500' : 'border-gray-200'}`}
                >
                    <h3 className="font-medium text-gray-800">Completed</h3>
                    <span className="text-green-600 font-bold">
                        {stats.PickedUp}
                    </span>
                </div>

                <div
                    onClick={() => setStatusFilter('Rejected')}
                    className={`bg-white w-full py-1 space-y-1.5 text-center text-sm cursor-pointer hover:border-red-500 rounded-md border ${statusFilter === 'Rejected' ? 'border-red-500' : 'border-gray-200'}`}
                >
                    <h3 className="font-medium text-gray-800">Rejected</h3>
                    <span className="text-red-600 font-bold">
                        {stats.Rejected}
                    </span>
                </div>
            </div>
        )
    );
}

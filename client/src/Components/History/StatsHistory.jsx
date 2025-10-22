import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { orderService } from '../../Services';
import { useUserContext, useOrderContext } from '../../Contexts';
import { icons } from '../../Assets/icons';

export default function StatsHistory() {
    const { stats, setStats, statusFilter, setStatusFilter, dateFilter } =
        useOrderContext();
    const [loading, setLoading] = useState(true);
    const { user } = useUserContext();

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

    return loading ? (
        <div className="flex justify-center py-4">
            <div className="size-5 fill-[#4977ec] dark:text-[#a2bdff]">
                {icons.loading}
            </div>
        </div>
    ) : (
        <div className="flex gap-4 items-center justify-center w-full">
            <div
                onClick={() => setStatusFilter('Pending')}
                className={`bg-white w-full py-1 space-y-1.5 text-center text-sm cursor-pointer hover:border-blue-500 rounded-md border ${statusFilter === 'Pending' ? 'border-blue-500' : 'border-gray-200'}`}
            >
                <h3 className="font-medium text-gray-800">Pending</h3>
                <span className="text-blue-600 font-bold">{stats.Pending}</span>
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
                <span className="text-red-600 font-bold">{stats.Rejected}</span>
            </div>
        </div>
    );
}

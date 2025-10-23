import { useLayoutEffect, useState } from 'react';
import {
    CalendarFilter,
    StatsHistory,
    PendingHistory,
    RejectedHistory,
    CompletedHistory,
    DateBadge,
} from '../Components';
import { useOrderContext } from '../Contexts';

export default function HistoryPage() {
    const { statusFilter, stats, setDateFilter } = useOrderContext();
    const [loading, setLoading] = useState(true);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    useLayoutEffect(() => {
        setLoading(true);
        setDateFilter(yesterday.toLocaleDateString('en-CA'));
        setLoading(false);
        return () => setDateFilter(null);
    }, []);

    return loading ? null : (
        <div className="pl-2">
            <div className="flex items-center justify-between gap-6 mb-4">
                <h1 className="flex gap-4 justify-between items-center">
                    <p className="text-xl font-semibold text-gray-900">
                        Orders
                    </p>
                    <DateBadge />
                </h1>

                <div className="flex items-center gap-3">
                    <CalendarFilter maxDate={yesterday} />
                    <div className="text-nowrap text-center border-1 border-gray-200 rounded-md px-2 py-1 text-sm bg-white text-[#4977ec] font-medium">
                        Total Orders: {stats.Total}
                    </div>
                </div>
            </div>

            <div className="mb-4">
                <StatsHistory />
            </div>

            {statusFilter === 'Pending' && <PendingHistory />}
            {statusFilter === 'PickedUp' && <CompletedHistory />}
            {statusFilter === 'Rejected' && <RejectedHistory />}
        </div>
    );
}

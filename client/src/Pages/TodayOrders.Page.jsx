import { useSearchParams } from 'react-router-dom';
import {
    CompletedOrders,
    PendingOrders,
    Filter,
    RejectedOrders,
    PreparedOrders,
} from '../Components';

export default function TodayOrdersPage() {
    const [searchParams] = useSearchParams();
    const filter = searchParams.get('filter') || 'Pending'; // Default to 'Pending'

    const options = [
        { value: 'Pending', label: 'Pending' },
        { value: 'PickedUp', label: 'Completed' },
        { value: 'Rejected', label: 'Rejected' },
        { value: 'Prepared', label: 'Prepared' },
    ];

    return (
        <div className="w-full p-4">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Today's Orders
                </h1>
                <Filter options={options} defaultOption={filter} />
            </div>

            {/* Render Based on Filter */}
            <div className="">
                {filter === 'Pending' ? (
                    <PendingOrders />
                ) : filter === 'Rejected' ? (
                    <RejectedOrders />
                ) : filter === 'Prepared' ? (
                    <PreparedOrders />
                ) : (
                    <CompletedOrders />
                )}
            </div>
        </div>
    );
}

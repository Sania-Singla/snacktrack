import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PendingOrders, Filter, Orders, Button } from '../Components';
import { toggleAudio, getAudioState, subscribeToAudioChanges } from '../Utils';

export default function TodayOrdersPage() {
    const [searchParams] = useSearchParams();
    const [audioEnabled, setAudioEnabled] = useState(false);
    const filter = searchParams.get('filter') || 'Pending';

    useEffect(() => {
        // Initialize with current state
        setAudioEnabled(getAudioState());
        // Subscribe to changes
        return subscribeToAudioChanges((enabled) => setAudioEnabled(enabled));
    }, []);

    const options = [
        { value: 'Pending', label: 'Pending' },
        { value: 'PickedUp', label: 'Completed' },
        { value: 'Rejected', label: 'Rejected' },
        { value: 'Prepared', label: 'Prepared' },
    ];

    return (
        <div className="w-full p-4">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                    Today's Orders
                </h1>
                <div className="flex items-center justify-center gap-5">
                    <div className="relative">
                        <Button
                            btnText="🔔"
                            title={
                                audioEnabled ? 'Disable Audio' : 'Enable Audio'
                            }
                            className={`bg-[#ffffff] size-[40px] text-lg group rounded-full drop-shadow-sm ${
                                !audioEnabled ? 'opacity-70' : ''
                            }`}
                            onClick={toggleAudio}
                        />
                        {!audioEnabled && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-8 h-[2px] bg-red-500 rotate-45 transform origin-center" />
                            </div>
                        )}
                    </div>
                    <Filter options={options} defaultOption={filter} />
                </div>
            </div>

            {filter === 'Pending' ? (
                <PendingOrders filter={filter} />
            ) : (
                <Orders filter={filter} />
            )}
        </div>
    );
}

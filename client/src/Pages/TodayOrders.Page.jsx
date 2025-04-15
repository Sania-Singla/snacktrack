import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PendingOrders, Filter, Orders, Button } from '../Components';
import { toggleAudio, getAudioState, subscribeToAudioChanges } from '../Utils';
import { useUserContext } from '../Contexts';
import toast from 'react-hot-toast';

export default function TodayOrdersPage() {
    const [searchParams] = useSearchParams();
    const { audioEnabled, setAudioEnabled } = useUserContext();
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
        <div className="w-full sm:p-4">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
                    <div className="px-3 py-[3px] text-sm font-bold rounded-full border border-blue-200 bg-blue-50 text-blue-700">
                        Today
                    </div>
                </div>
                <div className="flex items-center justify-center gap-4">
                    <div className="relative">
                        <Button
                            btnText="🔔"
                            title={
                                audioEnabled ? 'Disable Audio' : 'Enable Audio'
                            }
                            className={`bg-[#ffffff] size-[40px] text-lg group rounded-full drop-shadow-sm ${
                                !audioEnabled ? 'opacity-70' : ''
                            }`}
                            onClick={() => {
                                toggleAudio();
                                audioEnabled
                                    ? toast.error('Audio Disabled')
                                    : toast.success('Audio Enabled');
                            }}
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

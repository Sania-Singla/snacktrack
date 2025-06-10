import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PendingOrders, Filter, Orders, Button } from '../Components';
import { toggleAudio, getAudioState, subscribeToAudioChanges } from '../Utils';
import { useUserContext } from '../Contexts';
import toast from 'react-hot-toast';
import { orderService } from '../Services';

export default function TodayOrdersPage() {
    const [searchParams] = useSearchParams();
    const { audioEnabled, setAudioEnabled } = useUserContext();
    const filter = searchParams.get('filter') || 'Pending';
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { user } = useUserContext();

    useEffect(() => {
        setAudioEnabled(getAudioState());
        return subscribeToAudioChanges((enabled) => setAudioEnabled(enabled));
    }, []);

    const options = [
        { value: 'Pending', label: 'Pending' },
        { value: 'PickedUp', label: 'Completed' },
        { value: 'Rejected', label: 'Rejected' },
        { value: 'Prepared', label: 'Prepared' },
    ];

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        (async function () {
            try {
                setLoading(true);
                const res = await orderService.getOrderStats(
                    user.canteenId,
                    signal
                );
                if (res && !res.message) setStats(res);
                setLoading(false);
            } catch (err) {
                navigate('/server-error');
            }
        })();

        return () => controller.abort();
    }, []);

    return (
        <div className="w-full sm:p-4">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
                    <div className="px-3 py-[3px] text-[15px] font-bold rounded-full border border-blue-200 bg-blue-50 text-blue-700">
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

            {loading ? (
                <div className="my-8">loading...</div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    {/* Pending Orders */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-medium text-gray-500">
                                Pending
                            </h3>
                            <div className="size-7 rounded-full bg-blue-50 flex items-center justify-center">
                                <span className="text-blue-600 text-[15px] font-bold">
                                    {stats.pending}
                                </span>
                            </div>
                        </div>
                        <div className="h-1 w-full bg-gray-100 mt-4">
                            <div
                                className="h-1 bg-blue-500 rounded-full"
                                style={{ width: '100%' }}
                            />
                        </div>
                    </div>

                    {/* Prepared Orders */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-medium text-gray-500">
                                Prepared
                            </h3>
                            <div className="size-7 rounded-full bg-purple-50 flex items-center justify-center">
                                <span className="text-purple-600 text-[15px] font-bold">
                                    {stats.prepared}
                                </span>
                            </div>
                        </div>
                        <div className="h-1 w-full bg-gray-100 mt-4">
                            <div
                                className="h-1 bg-purple-500 rounded-full"
                                style={{ width: '50%' }}
                            />
                        </div>
                    </div>

                    {/* Picked Up Orders */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-medium text-gray-500">
                                Completed
                            </h3>
                            <div className="size-7 rounded-full bg-green-50 flex items-center justify-center">
                                <span className="text-green-600 text-[15px] font-bold">
                                    {stats.pickedUp}
                                </span>
                            </div>
                        </div>
                        <div className="h-1 w-full bg-gray-100 mt-4">
                            <div
                                className="h-1 bg-green-500 rounded-full"
                                style={{ width: '75%' }}
                            />
                        </div>
                    </div>

                    {/* Rejected Orders */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-medium text-gray-500">
                                Rejected
                            </h3>
                            <div className="size-7 rounded-full bg-red-50 flex items-center justify-center">
                                <span className="text-red-600 text-[15px] font-bold">
                                    {stats.rejected}
                                </span>
                            </div>
                        </div>
                        <div className="h-1 w-full bg-gray-100 mt-4">
                            <div
                                className="h-1 bg-red-500 rounded-full"
                                style={{ width: '15%' }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {filter === 'Pending' ? (
                <PendingOrders filter={filter} />
            ) : (
                <Orders filter={filter} />
            )}
        </div>
    );
}

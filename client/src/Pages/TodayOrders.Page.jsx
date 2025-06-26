import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PendingOrders, Orders, Button, CalendarFilter } from '../Components';
import {
    toggleAudio,
    getAudioState,
    subscribeToAudioChanges,
    playSound,
} from '../Utils';
import { useSocketContext, useUserContext } from '../Contexts';
import toast from 'react-hot-toast';
import { orderService } from '../Services';

export default function TodayOrdersPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { audioEnabled, setAudioEnabled, user } = useUserContext();
    const [stats, setStats] = useState({
        Total: 0,
        Pending: 0,
        Prepared: 0,
        PickedUp: 0,
        Rejected: 0,
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const dateFilter = searchParams.get('date'); // could be null or e.g., '2025-06-05'
    const statusFilter = searchParams.get('status') || 'Pending';
    const { socket } = useSocketContext();

    useEffect(() => {
        setAudioEnabled(getAudioState());
        return subscribeToAudioChanges((enabled) => setAudioEnabled(enabled));
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        (async function () {
            try {
                setLoading(true);
                const res = await orderService.getOrderStats(
                    user.canteenId,
                    dateFilter,
                    signal
                );
                if (res && !res.message) setStats(res);
                setLoading(false);
            } catch (err) {
                navigate('/server-error');
            }
        })();

        return () => controller.abort();
    }, [dateFilter]);

    // socket event listeners
    useEffect(() => {
        if (!socket) return;

        socket.on('newOrder', async (order) => {
            await playSound();
            setStats((prev) => ({
                ...prev,
                Total: prev.Total + 1,
                [order.status]: prev[order.status] + 1, // Prepared or Pending
            }));
        });

        socket.on('orderPrepared', (order) => {
            setStats((prev) => ({
                ...prev,
                Pending: prev.Pending - 1,
                Prepared: prev.Prepared + 1,
            }));
        });

        socket.on('orderPickedUp', (order) => {
            setStats((prev) => ({
                ...prev,
                Prepared: prev.Prepared - 1,
                PickedUp: prev.PickedUp + 1,
            }));
        });

        socket.on('orderRejected', (order) => {
            if (order.status === 'Prepared') {
                setStats((prev) => ({
                    ...prev,
                    Prepared: prev.Prepared - 1,
                    Rejected: prev.Rejected + 1,
                }));
            } else
                setStats((prev) => ({
                    ...prev,
                    Pending: prev.Pending - 1,
                    Rejected: prev.Rejected + 1,
                }));
        });
    }, [socket]);

    function handleStatusClick(status) {
        if (statusFilter === status) return; // do nothing
        const newParams = new URLSearchParams(searchParams);
        newParams.set('status', status);
        setSearchParams(newParams);
    }

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
                    <CalendarFilter />
                    <div className="relative">
                        <Button
                            btnText="🔔"
                            title={
                                audioEnabled ? 'Disable Audio' : 'Enable Audio'
                            }
                            className={`bg-[#ffffff] flex items-center justify-center size-[37px] text-[17px] group rounded-full drop-shadow-sm ${
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
                                <div className="w-7 h-[2px] bg-red-500 rotate-45 transform origin-center" />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="my-8">loading...</div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {/* Pending Orders */}
                    <div
                        onClick={() => handleStatusClick('Pending')}
                        className="bg-white p-4 flex justify-between cursor-pointer hover:border-blue-500 rounded-lg shadow-sm border border-gray-100"
                    >
                        <h3 className="text-lg font-medium text-gray-800">
                            Pending
                        </h3>
                        <div className="size-7 rounded-full bg-blue-50 flex items-center justify-center">
                            <span className="text-blue-600 font-bold">
                                {stats.Pending}
                            </span>
                        </div>
                    </div>

                    {/* Prepared Orders */}
                    <div
                        onClick={() => handleStatusClick('Prepared')}
                        className="bg-white p-4 flex justify-between cursor-pointer hover:border-purple-500 rounded-lg shadow-sm border border-gray-100"
                    >
                        <h3 className="text-lg font-medium text-gray-800">
                            Prepared
                        </h3>
                        <div className="size-7 rounded-full bg-purple-50 flex items-center justify-center">
                            <span className="text-purple-600 font-bold">
                                {stats.Prepared}
                            </span>
                        </div>
                    </div>

                    {/* Picked Up Orders */}
                    <div
                        onClick={() => handleStatusClick('PickedUp')}
                        className="bg-white p-4 flex justify-between cursor-pointer hover:border-green-500 border rounded-lg shadow-sm border-gray-100"
                    >
                        <h3 className="text-lg font-medium text-gray-800">
                            Completed
                        </h3>
                        <div className="size-7 rounded-full bg-green-50 flex items-center justify-center">
                            <span className="text-green-600 font-bold">
                                {stats.PickedUp}
                            </span>
                        </div>
                    </div>

                    {/* Rejected Orders */}
                    <div
                        onClick={() => handleStatusClick('Rejected')}
                        className="bg-white p-4 flex justify-between cursor-pointer hover:border-red-500 rounded-lg shadow-sm border border-gray-100"
                    >
                        <h3 className="text-lg font-medium text-gray-800">
                            Rejected
                        </h3>
                        <div className="size-7 rounded-full bg-red-50 flex items-center justify-center">
                            <span className="text-red-600 font-bold">
                                {stats.Rejected}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {statusFilter === 'Pending' ? <PendingOrders /> : <Orders />}
        </div>
    );
}

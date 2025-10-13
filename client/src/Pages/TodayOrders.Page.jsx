import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PendingOrders, Orders, Button, CalendarFilter } from '../Components';
import {
    toggleAudio,
    getAudioState,
    subscribeToAudioChanges,
    playSound,
} from '../Utils';
import { useSocketContext, useUserContext } from '../Contexts';
import { SOCKET_EVENTS } from '../Constants/constants';
import toast from 'react-hot-toast';
import { orderService } from '../Services';

export default function TodayOrdersPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [pendingOrders, setPendingOrders] = useState([]);
    const [orders, setOrders] = useState([]);
    const { audioEnabled, setAudioEnabled, user } = useUserContext();
    const [stats, setStats] = useState({
        Total: 0,
        Pending: 0,
        Prepared: 0,
        PickedUp: 0,
        Rejected: 0,
    });
    const { socket } = useSocketContext();
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const dateFilter = searchParams.get('date') || undefined;
    const [statusFilter, setStatusFilter] = useState(
        searchParams.get('status') || 'Pending'
    );

    // Ref to hold the current statusFilter for use inside socket event handlers
    const statusFilterRef = useRef(statusFilter);

    useEffect(() => {
        const status = searchParams.get('status') || 'Pending';
        setStatusFilter(status);
    }, [searchParams]);

    useEffect(() => {
        statusFilterRef.current = statusFilter; // update ref whenever state changes
    }, [statusFilter]);

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
                const res = await orderService.getOrderStats({
                    canteenId: user.canteenId,
                    date: dateFilter,
                    signal,
                });
                if (res && !res.message) setStats(res);
                setLoading(false);
            } catch (err) {
                navigate('/server-error');
            }
        })();

        return () => controller.abort();
    }, [dateFilter]);

    function handleStatusClick(status) {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('status', status);
        setSearchParams(newParams);
    }

    // Socket event listeners
    useEffect(() => {
        if (!socket) return;

        async function newOrder(order) {
            if (user.role === 'contractor') {
                setStats((prev) => ({
                    ...prev,
                    Total: prev.Total + 1,
                    [order.status]: prev[order.status] + 1,
                }));

                const hasSnacks = order.items.some(
                    (item) => item.type === 'Snack'
                );

                if (hasSnacks && statusFilterRef.current === 'Pending') {
                    setPendingOrders((prev) => [...prev, order]);
                } else if (
                    !hasSnacks &&
                    statusFilterRef.current === 'Prepared'
                ) {
                    setOrders((prev) => [...prev, order]);
                }

                await playSound();
            }
        }

        function orderPrepared(order) {
            if (user.role === 'contractor') {
                setStats((prev) => ({
                    ...prev,
                    Pending: prev.Pending - 1,
                    Prepared: prev.Prepared + 1,
                }));

                if (statusFilterRef.current === 'Pending') {
                    setPendingOrders((prev) =>
                        prev.filter((o) => o._id !== order._id)
                    );
                } else if (statusFilterRef.current === 'Prepared') {
                    setOrders((prev) => [...prev, order]);
                }
            }
        }

        function orderPickedUp(order) {
            if (user.role === 'contractor') {
                setStats((prev) => ({
                    ...prev,
                    Prepared: prev.Prepared - 1,
                    PickedUp: prev.PickedUp + 1,
                }));
                if (statusFilterRef.current === 'Prepared') {
                    setOrders((prev) =>
                        prev.filter((o) => o._id !== order._id)
                    );
                } else if (statusFilterRef.current === 'PickedUp') {
                    setOrders((prev) => [...prev, order]);
                }
            }
        }

        function orderRejected(order) {
            if (user.role === 'contractor') {
                if (order.status === 'Prepared') {
                    setStats((prev) => ({
                        ...prev,
                        Prepared: prev.Prepared - 1,
                        Rejected: prev.Rejected + 1,
                    }));
                } else {
                    setStats((prev) => ({
                        ...prev,
                        Pending: prev.Pending - 1,
                        Rejected: prev.Rejected + 1,
                    }));
                }

                if (statusFilterRef.current === 'Prepared') {
                    setOrders((prev) =>
                        prev.filter((o) => o._id !== order._id)
                    );
                } else if (statusFilterRef.current === 'Rejected') {
                    setOrders((prev) => [...prev, order]);
                } else if (statusFilterRef.current === 'Pending') {
                    setPendingOrders((prev) =>
                        prev.filter((o) => o._id !== order._id)
                    );
                }
            }
        }

        function itemPrepared({ orderId, itemId }) {
            setPendingOrders((prev) =>
                prev.map((o) =>
                    o._id === orderId
                        ? {
                              ...o,
                              items: o.items.map((i) =>
                                  i.id === itemId
                                      ? {
                                            ...i,
                                            preparedCount: i.preparedCount + 1,
                                        }
                                      : i
                              ),
                          }
                        : o
                )
            );
        }

        function itemPickedUp({ orderId, itemId }) {
            if (statusFilterRef.current === 'Pending') {
                setPendingOrders((prev) =>
                    prev.map((o) =>
                        o._id === orderId
                            ? {
                                  ...o,
                                  items: o.items.map((i) =>
                                      i.id === itemId
                                          ? {
                                                ...i,
                                                pickedUpCount: i.preparedCount,
                                            }
                                          : i
                                  ),
                              }
                            : o
                    )
                );
            } else if (statusFilterRef.current === 'Prepared') {
                setOrders((prev) => {
                    const originalOrder = prev.find((o) => o._id === orderId);
                    if (!originalOrder) return prev;

                    const updatedOrders = prev
                        .map((o) =>
                            o._id === orderId
                                ? {
                                      ...o,
                                      items: o.items.map((i) =>
                                          i.id === itemId
                                              ? {
                                                    ...i,
                                                    pickedUpCount:
                                                        i.preparedCount,
                                                }
                                              : i
                                      ),
                                  }
                                : o
                        )
                        .filter((o) =>
                            o.items.some((i) => i.pickedUpCount < i.quantity)
                        );

                    const orderWasRemoved = !updatedOrders.some(
                        (o) => o._id === orderId
                    );

                    if (orderWasRemoved) {
                        (async () => {
                            try {
                                const res =
                                    await orderService.updateOrderStatus({
                                        orderId,
                                        status: 'PickedUp',
                                    });
                                if (
                                    res &&
                                    res.message ===
                                        'order status updated successfully'
                                ) {
                                    socket.emit(
                                        SOCKET_EVENTS.ORDER_PICKEDUP,
                                        originalOrder
                                    );
                                }
                            } catch (error) {
                                console.error(
                                    'Failed to update order status:',
                                    error
                                );
                            }
                        })();
                    }

                    return updatedOrders;
                });
            }
        }

        socket.on(SOCKET_EVENTS.NEW_ORDER, newOrder);
        socket.on(SOCKET_EVENTS.ORDER_PREPARED, orderPrepared);
        socket.on(SOCKET_EVENTS.ORDER_PICKEDUP, orderPickedUp);
        socket.on(SOCKET_EVENTS.ORDER_REJECTED, orderRejected);
        socket.on(SOCKET_EVENTS.ITEM_PREPARED, itemPrepared);
        socket.on(SOCKET_EVENTS.ITEM_PICKEDUP, itemPickedUp);

        return () => {
            socket.off(SOCKET_EVENTS.NEW_ORDER, newOrder);
            socket.off(SOCKET_EVENTS.ORDER_PREPARED, orderPrepared);
            socket.off(SOCKET_EVENTS.ORDER_PICKEDUP, orderPickedUp);
            socket.off(SOCKET_EVENTS.ORDER_REJECTED, orderRejected);
            socket.off(SOCKET_EVENTS.ITEM_PREPARED, itemPrepared);
            socket.off(SOCKET_EVENTS.ITEM_PICKEDUP, itemPickedUp);
        };
    }, [socket]);

    return (
        <div className="w-full sm:p-4">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
                    <div className="px-3 mt-1 py-[2px] text-sm font-semibold rounded-full border border-blue-200 bg-blue-50 text-blue-700">
                        Today
                    </div>
                </div>
                <div className="flex items-center justify-center gap-3">
                    <CalendarFilter />
                    <div className="relative">
                        <Button
                            btnText="🔔"
                            title={
                                audioEnabled ? 'Disable Audio' : 'Enable Audio'
                            }
                            className={`bg-[#ffffff] flex items-center justify-center size-8 group rounded-full drop-shadow-sm ${
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
                                <div className="w-6.5 h-[2px] bg-red-500 rotate-45 transform origin-center" />
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
                        style={{
                            borderColor:
                                statusFilter === 'Pending' ? 'blue' : '',
                        }}
                        className="bg-white p-3 md:p-4 flex justify-between cursor-pointer hover:border-blue-500 rounded-lg shadow-sm border border-gray-100"
                    >
                        <h3 className="font-medium text-gray-800">Pending</h3>
                        <div className="size-7 rounded-full bg-blue-50 flex items-center justify-center">
                            <span className="text-blue-600 font-bold">
                                {stats.Pending}
                            </span>
                        </div>
                    </div>

                    {/* Prepared Orders */}
                    <div
                        onClick={() => handleStatusClick('Prepared')}
                        style={{
                            borderColor:
                                statusFilter === 'Prepared' ? '#9810fa' : '',
                        }}
                        className="bg-white p-3 md:p-4 flex justify-between cursor-pointer hover:border-purple-500 rounded-lg shadow-sm border border-gray-100"
                    >
                        <h3 className="font-medium text-gray-800">Prepared</h3>
                        <div className="size-7 rounded-full bg-purple-50 flex items-center justify-center">
                            <span className="text-purple-600 font-bold">
                                {stats.Prepared}
                            </span>
                        </div>
                    </div>

                    {/* Picked Up Orders */}
                    <div
                        onClick={() => handleStatusClick('PickedUp')}
                        style={{
                            borderColor:
                                statusFilter === 'PickedUp'
                                    ? 'oklch(62.7% 0.194 149.214)'
                                    : '',
                        }}
                        className="bg-white p-3 md:p-4 flex justify-between cursor-pointer hover:border-green-500 border rounded-lg shadow-sm border-gray-100"
                    >
                        <h3 className="font-medium text-gray-800">Completed</h3>
                        <div className="size-7 rounded-full bg-green-50 flex items-center justify-center">
                            <span className="text-green-600 font-bold">
                                {stats.PickedUp}
                            </span>
                        </div>
                    </div>

                    {/* Rejected Orders */}
                    <div
                        onClick={() => handleStatusClick('Rejected')}
                        style={{
                            borderColor:
                                statusFilter === 'Rejected' ? 'red' : '',
                        }}
                        className="bg-white p-3 md:p-4 flex justify-between cursor-pointer hover:border-red-500 rounded-lg shadow-sm border border-gray-100"
                    >
                        <h3 className="font-medium text-gray-800">Rejected</h3>
                        <div className="size-7 rounded-full bg-red-50 flex items-center justify-center">
                            <span className="text-red-600 font-bold">
                                {stats.Rejected}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {statusFilter === 'Pending' ? (
                <PendingOrders
                    pendingOrders={pendingOrders}
                    setPendingOrders={setPendingOrders}
                />
            ) : (
                <Orders orders={orders} setOrders={setOrders} />
            )}
        </div>
    );
}

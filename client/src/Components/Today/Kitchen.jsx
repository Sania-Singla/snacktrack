import { useEffect, useState } from 'react';
import { orderService } from '../../Services';
import { useSocketContext } from '../../Contexts';
import { AudioBtn, Button } from '..';
import { SOCKET_EVENTS } from '../../Constants';
import toast from 'react-hot-toast';
import { Resizable } from 're-resizable';
import { icons } from '../../Assets/icons';

export default function Kitchen({ showOrderSide, setShowOrderSide }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [orderElements, setOrderElements] = useState([]);
    const [summary, setSummary] = useState({});
    const { socket } = useSocketContext();

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        (async function () {
            try {
                const res = await orderService.getKitchenOrders(signal);
                if (res && !res.message) {
                    const updatedOrders = res.orders.map((o) => {
                        o.items = o.items.filter((i) => !i.prepared);
                        return o;
                    });
                    setOrders(updatedOrders);
                }
            } catch (err) {
                toast.error('Something went wrong. Please try again.');
            } finally {
                setLoading(false);
            }
        })();

        return () => controller.abort();
    }, []);

    // socket event listeners
    useEffect(() => {
        if (!socket) return;

        function orderPending(order) {
            if (order.status === 'Pending') {
                setOrders((prev) => {
                    const snacks = order.items.filter(
                        (i) => i.type === 'Snack'
                    );

                    return [...prev, { ...order, items: snacks }];
                });
            }
        }

        function orderRejected(orderId) {
            setOrders((prev) => prev.filter((o) => o._id !== orderId));
        }

        function itemPrepared({ orderId, itemId }) {
            setOrders((prev) =>
                prev.reduce((acc, o) => {
                    if (o._id !== orderId) {
                        acc.push(o);
                        return acc;
                    }

                    const items = o.items
                        .map((i) =>
                            i.id === itemId ? { ...i, prepared: true } : i
                        )
                        .filter((i) => !i.prepared);

                    if (!items.length) {
                        // fire and forget
                        orderService
                            .updateOrderStatus({ orderId, status: 'Prepared' })
                            .catch(() =>
                                toast.error(
                                    'Something went wrong. Please try again.'
                                )
                            );
                        return acc; // skip adding
                    }

                    acc.push({ ...o, items });
                    return acc;
                }, [])
            );
        }

        socket.on(SOCKET_EVENTS.ORDER_PENDING, orderPending);
        socket.on(SOCKET_EVENTS.ORDER_REJECTED, orderRejected);
        socket.on(SOCKET_EVENTS.ITEM_PREPARED, itemPrepared);

        return () => {
            socket.off(SOCKET_EVENTS.ORDER_PENDING, orderPending);
            socket.off(SOCKET_EVENTS.ORDER_REJECTED, orderRejected);
            socket.off(SOCKET_EVENTS.ITEM_PREPARED, itemPrepared);
        };
    }, [socket]);

    function generateOrderElements(orders) {
        return orders.flatMap((o) =>
            o.items.map((i) => (
                <div
                    key={`${o._id}-${i.id}`}
                    className="space-y-2 w-full border-gray-200 border-1 rounded-md p-3"
                >
                    <div className="flex justify-between items-center">
                        <div className="flex items-center justify-center gap-2">
                            <p className="text-gray-800 font-medium text-sm">
                                {i.name}
                            </p>
                            <div className="bg-[#4977ec]/10 text-[#4977ec] flex items-center justify-center size-5 rounded-full font-bold text-xs">
                                {i.quantity}
                            </div>
                        </div>

                        <Button
                            className="rounded-sm size-5.5 text-xl pb-1 flex items-center justify-center text-white bg-[#4977ec] hover:bg-[#3b62c2]"
                            onClick={() =>
                                socket.emit(SOCKET_EVENTS.ITEM_PREPARED, {
                                    itemId: i.id,
                                    orderId: o._id,
                                    studentId: o.studentId,
                                    canteenId: o.canteenId,
                                })
                            }
                            btnText="-"
                        />
                    </div>

                    {i.specialInstructions && (
                        <div className="text-sm text-red-500 italic">
                            <span className="font-medium mr-1">Note:</span>
                            <span className="italic">
                                {i.specialInstructions}
                            </span>
                        </div>
                    )}
                </div>
            ))
        );
    }

    function updateSummary(orders) {
        const newSummary = {};
        orders.forEach((o) => {
            o.items.forEach((i) => {
                newSummary[i.name] = (newSummary[i.name] || 0) + i.quantity;
            });
        });
        return newSummary;
    }

    useEffect(() => {
        if (!orders.length) return;
        // setSummary(updateSummary(orders));
        setOrderElements(generateOrderElements(orders));
    }, [orders]);

    return (
        <>
            <div className="flex justify-between items-center mb-4">
                <div className="flex gap-4 items-center">
                    {!showOrderSide && (
                        <div
                            onClick={() => setShowOrderSide(true)}
                            className="size-8 rounded-full border-1 border-gray-200 flex items-center justify-center bg-white cursor-pointer"
                        >
                            <div className="size-3.5 fill-gray-800 -rotate-90">
                                {icons.arrowDown}
                            </div>
                        </div>
                    )}
                    <h2 className="text-xl font-semibold text-gray-800">
                        Kitchen
                    </h2>
                </div>
                {/* <AudioBtn /> */}
            </div>

            {!loading &&
                (orders.length > 0 ? (
                    <div className="flex gap-6 lg:gap-4 flex-col w-full lg:flex-row">
                        {/* <section className="w-full lg:w-[70%] grid grid-flow-dense grid-cols-[repeat(auto-fit,minmax(120px,1fr))] h-fit gap-4">
                            {Object.entries(summary)
                                .sort(([a], [b]) => a.localeCompare(b))
                                .map(([name, quantity]) => (
                                    <div
                                        key={name}
                                        className="border-1 rounded-md text-sm lg:text-base bg-white font-semibold text-center border-gray-200 px-4 py-2 flex flex-col items-center justify-center gap-3"
                                    >
                                        <p className="text-gray-900">{name}</p>
                                        <p className="text-[#4977ec]">
                                            {quantity}
                                        </p>
                                    </div>
                                ))}
                        </section> */}

                        <Resizable
                            defaultSize={{ width: '30%' }}
                            enable={{ left: true }}
                            className="max-w-full min-w-full lg:min-w-[30%] lg:max-w-[50%] grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4"
                        >
                            {orderElements}
                        </Resizable>
                    </div>
                ) : (
                    <p className="text-gray-400 italic text-center">
                        Nothing to Prepare, Chill
                    </p>
                ))}
        </>
    );
}

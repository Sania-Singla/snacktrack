import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { orderService } from '../../Services';
import { useSocketContext, useUserContext } from '../../Contexts';
import { icons } from '../../Assets/icons';
import { Button } from '../../Components';
import { LOGO, SOCKET_EVENTS } from '../../Constants/constants';

export default function KitchenPage() {
    const navigate = useNavigate();
    const [kitchenOrders, setKitchenOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUserContext();
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
                    setKitchenOrders(res.orders);
                    setSummary(updateSummary(res.orders));
                    setOrderElements(generateOrderElements(res.orders));
                }
                setLoading(false);
            } catch (err) {
                navigate('/server-error');
            }
        })();

        return () => controller.abort();
    }, []);

    // socket event listeners
    useEffect(() => {
        if (!socket) return;

        function newOrder(order) {
            if (order.status === 'Pending') {
                setKitchenOrders((prev) => {
                    // Filter to only include snack items
                    const filteredOrder = {
                        ...order,
                        items: order.items.filter((i) => i.type === 'Snack'),
                    };

                    // Skip if no snack items or order already exists
                    if (
                        !filteredOrder.items.length ||
                        prev.some((o) => o._id === order._id)
                    ) {
                        return prev;
                    }

                    const updatedOrders = [...prev, filteredOrder];

                    // Update summary and elements
                    setSummary(updateSummary(updatedOrders));
                    setOrderElements(generateOrderElements(updatedOrders));

                    return updatedOrders;
                });
            }
        }

        function orderRejected(order) {
            setKitchenOrders((prev) => prev.filter((o) => o._id !== order._id));
        }

        async function itemPrepared({ orderId, itemId }) {
            setKitchenOrders((prev) => {
                // First find the order before modification (for potential complete preparation)
                const originalOrder = prev.find((o) => o._id === orderId);
                if (!originalOrder) return prev;

                const updatedOrders = prev
                    .map((o) => {
                        if (o._id === orderId) {
                            return {
                                ...o,
                                items: o.items
                                    .map((i) =>
                                        i.id === itemId
                                            ? {
                                                  ...i,
                                                  preparedCount:
                                                      i.preparedCount + 1,
                                              }
                                            : i
                                    )
                                    .filter(
                                        (i) => i.preparedCount < i.quantity
                                    ),
                            };
                        }
                        return o;
                    })
                    .filter((o) => o.items.length > 0);

                // Update summary and elements
                setSummary(updateSummary(updatedOrders));
                setOrderElements(generateOrderElements(updatedOrders));

                // Check if order was completely prepared
                const orderWasRemoved = !updatedOrders.some(
                    (o) => o._id === orderId
                );

                if (orderWasRemoved) {
                    // IIFE to handle the async operation
                    (async () => {
                        try {
                            const res = await orderService.updateOrderStatus({
                                orderId,
                                status: 'Prepared',
                            });
                            if (
                                res &&
                                res.message ===
                                    'order status updated successfully'
                            ) {
                                socket.emit(
                                    SOCKET_EVENTS.ORDER_PREPARED,
                                    res.order
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

        socket.on(SOCKET_EVENTS.NEW_ORDER, newOrder);
        socket.on(SOCKET_EVENTS.ORDER_REJECTED, orderRejected);
        socket.on(SOCKET_EVENTS.ITEM_PREPARED, itemPrepared);

        return () => {
            socket.off(SOCKET_EVENTS.NEW_ORDER, newOrder);
            socket.off(SOCKET_EVENTS.ORDER_REJECTED, orderRejected);
            socket.off(SOCKET_EVENTS.ITEM_PREPARED, itemPrepared);
        };
    }, [socket]);

    function generateOrderElements(orders) {
        return orders.flatMap((o) =>
            o.items
                .filter(
                    (i) => i.type === 'Snack' && i.preparedCount < i.quantity
                )
                .map((i) => (
                    <div
                        key={`${o._id}-${i.id}`}
                        className="space-y-2 border-gray-200 border-[0.01rem] rounded-xl p-3"
                    >
                        <div className="flex justify-between items-center">
                            <div className="flex items-center justify-center gap-2">
                                <p className="text-gray-800 font-medium text-[14px]">
                                    {i.name}
                                </p>
                                <div className="bg-[#4977ec]/10 text-[#4977ec] flex items-center justify-center size-[20px] rounded-full font-bold text-[12px]">
                                    {i.quantity - i.preparedCount}
                                </div>
                            </div>

                            {user.role === 'staff' && (
                                <Button
                                    className="px-2 rounded-sm h-[23px] text-2xl pb-[5px] flex items-center justify-center text-white bg-[#4977ec] hover:bg-[#3b62c2]"
                                    onClick={() =>
                                        socket.emit(
                                            SOCKET_EVENTS.ITEM_PREPARED,
                                            {
                                                order: o,
                                                itemId: i.id,
                                            }
                                        )
                                    }
                                    btnText="-"
                                />
                            )}
                        </div>
                        {i.specialInstructions && (
                            <div className="text-[13px] text-red-500 italic">
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
            o.items
                .filter((i) => i.type === 'Snack')
                .forEach((i) => {
                    const remaining =
                        (newSummary[i.name] || 0) +
                        i.quantity -
                        i.preparedCount;
                    if (remaining !== 0) newSummary[i.name] = remaining;
                    else delete newSummary[i.name];
                });
        });
        return newSummary;
    }

    return loading ? (
        <div className="flex items-center justify-center w-full mt-10">
            <div className="size-5 fill-[#4977ec] dark:text-[#a2bdff]">
                {icons.loading}
            </div>
        </div>
    ) : (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <section className="w-full bg-white shadow-sm rounded-xl p-6 mb-8 h-fit">
                <div className="flex justify-between gap-6 items-center">
                    <div className="flex w-full items-center gap-3 mb-4">
                        <div>
                            <Link to={'/'}>
                                <div className="overflow-hidden rounded-full size-10 border-gray-200 border shadow-sm">
                                    <img
                                        src={LOGO}
                                        alt="Snack Track Logo"
                                        className="object-cover size-full hover:brightness-95"
                                    />
                                </div>
                            </Link>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 leading-6">
                            Kitchen Summary
                        </h2>
                    </div>
                    <p className="text-sm md:text-base font-medium w-fit text-center text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <span className="font-semibold text-blue-600">
                            {user.hostelType}
                            {user.hostelNumber}
                        </span>{' '}
                        - {user.hostelName}
                    </p>
                </div>
                <p className="text-gray-500 text-sm md:text-base">
                    Aggregated items for preparation, better kitchen management
                </p>
            </section>

            {/* orders */}
            {kitchenOrders.length > 0 ? (
                <section className="p-4 overflow-scroll bg-white rounded-xl shadow-sm flex flex-col md:flex-row md:gap-0 gap-6">
                    {/* summary */}
                    <section className="md:pr-4 md:p-2 w-full md:w-[70%] border-b-[0.01rem] md:border-r-[0.01rem] md:border-b-0 border-gray-200">
                        <h2 className="text-center font-bold text-xl mb-6">
                            Summary
                        </h2>
                        <div className="grid grid-flow-dense grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-7 md:mb-0">
                            {Object.entries(summary)
                                .sort(([nameA], [nameB]) =>
                                    nameA.localeCompare(nameB)
                                )
                                .map(([name, quantity]) => (
                                    <div
                                        key={name}
                                        className="border-[0.01rem] rounded-xl text-center border-gray-200 p-4 flex flex-col items-center justify-center gap-3"
                                    >
                                        <h3 className="font-semibold text-gray-900 text-lg w-fit">
                                            {name}
                                        </h3>
                                        <div className="bg-[#4977ec]/10 text-[#4977ec] flex items-center justify-center size-[30px] rounded-full font-bold text-sm">
                                            {quantity}
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </section>

                    {/* user wise */}
                    <section className="w-full md:w-[30%] md:ml-2 md:p-2">
                        <h2 className="text-center font-bold text-xl mb-6">
                            Orders
                        </h2>
                        <div className="flex flex-col gap-4">
                            {orderElements}
                        </div>
                    </section>
                </section>
            ) : (
                <p className="text-gray-400 italic text-center">
                    Nothing to Prepare, Chill
                </p>
            )}
        </div>
    );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../Services';
import { useSocketContext, useUserContext } from '../../Contexts';
import { icons } from '../../Assets/icons';
import { useRef } from 'react';
import { getRollNo } from '../../Utils';
import { Button } from '../../Components';

export default function KitchenPage() {
    const navigate = useNavigate();
    const [kitchenOrders, setKitchenOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUserContext();
    const [orderElements, setOrderElements] = useState([]);
    const [summary, setSummary] = useState({});
    const previousOrders = useRef(new Set());
    const { socket } = useSocketContext();

    function updateSummaryAndOrderElements(orders) {
        const newSummary = { ...summary };
        const newElements = [...orderElements];

        for (const o of orders) {
            previousOrders.current.add(o._id);

            for (const i of o.items) {
                // Update summary
                newSummary[i.name] = (newSummary[i.name] || 0) + i.quantity;

                // Update order elements
                newElements.push(
                    <div
                        key={`${o._id}-${i.id}`}
                        className="flex justify-between items-center border-gray-200 border-[0.01rem] rounded-xl p-3"
                    >
                        <div className="flex items-center gap-3">
                            <div className="size-10 rounded-full overflow-hidden shadow-sm">
                                <img
                                    src={o.studentInfo.avatar}
                                    alt={`${o.studentInfo.fullName} image`}
                                    className="size-full object-cover"
                                />
                            </div>
                            <div className="flex-1 space-y-[2px]">
                                <h3 className="flex items-center gap-1">
                                    <span className="font-medium text-[14px] text-gray-800 truncate">
                                        {o.studentInfo.fullName}
                                    </span>
                                    <span className="text-sm text-gray-600">
                                        •
                                    </span>
                                    <span className="text-xs text-gray-600">
                                        Roll No:{' '}
                                        {getRollNo(o.studentInfo.userName)}
                                    </span>
                                </h3>
                                <div className="flex items-center gap-1 text-xs text-gray-600">
                                    {o.studentInfo.phoneNumber}
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center justify-center gap-2">
                                <p className="text-gray-800 font-medium text-[14px]">
                                    {i.name}
                                </p>
                                <div className="bg-[#4977ec]/10 text-[#4977ec] flex items-center justify-center size-[20px] rounded-full font-bold text-[12px]">
                                    {i.quantity}
                                </div>
                            </div>

                            {user?.role !== 'contractor' && (
                                <Button
                                    className="px-2 rounded-sm h-[23px] text-2xl pb-[5px] flex items-center justify-center text-white bg-[#4977ec] hover:bg-[#3b62c2]"
                                    onClick={() =>
                                        socket?.emit('itemPrepared', {
                                            orderId: o._id,
                                            itemId: i.id,
                                        })
                                    }
                                    btnText="-"
                                />
                            )}
                        </div>
                    </div>
                );
            }
        }

        setSummary(newSummary);
        setOrderElements(newElements);
    }

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        (async function () {
            try {
                if (!user) navigate('/kitchen/verify-key');
                const res = await orderService.getKitchenOrders(signal);
                if (res && !res.message) {
                    setKitchenOrders(res.orders);
                    updateSummaryAndOrderElements(res.orders);
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

        socket.on('newOrder', (order) => {
            if (order.status === 'Pending') {
                const existingOrder = kitchenOrders.find(
                    (o) => o._id === order._id
                );
                if (existingOrder) return; // for socket multiple error

                setKitchenOrders((prev) => [
                    ...prev,
                    {
                        ...order,
                        items: order.items.filter((i) => i.type === 'Snack'),
                    },
                ]);

                updateSummaryAndOrderElements([order]);
            }
        });

        socket.on('orderRejected', (order) => {
            setKitchenOrders((prev) => prev.filter((o) => o._id !== order._id));
        });

        socket.on('itemPrepared', ({ orderId, itemId }) => {
            setKitchenOrders((prevOrders) => {
                const updatedOrders = prevOrders.map((o) => {
                    if (o._id === orderId) {
                        return {
                            ...o,
                            items: o.items.map((i) =>
                                i.id === itemId
                                    ? { ...i, quantity: i.quantity - 1 }
                                    : i
                            ),
                        };
                    } else return o;
                });

                // Check before removing items
                const updatedOrder = updatedOrders.find(
                    (o) => o._id === orderId
                );
                if (
                    updatedOrder &&
                    updatedOrder.items.every((item) => item.quantity === 0)
                ) {
                    socket.emit('orderPrepared', updatedOrder);
                }

                // Update summary here safely
                const itemName = prevOrders
                    .find((o) => o._id === orderId)
                    ?.items.find((i) => i.id === itemId)?.name;

                if (itemName) {
                    setSummary((prevSummary) => {
                        const newSummary = { ...prevSummary };
                        if (newSummary[itemName] > 1) newSummary[itemName]--;
                        else delete newSummary[itemName];
                        return newSummary;
                    });
                }

                // Now clean up zero-quantity items and orders
                const cleanedOrders = updatedOrders
                    .map((o) => ({
                        ...o,
                        items: o.items.filter((i) => i.quantity > 0),
                    }))
                    .filter((o) => o.items.length > 0);

                return cleanedOrders;
            });
        });
    }, [socket]);

    return loading ? (
        <div className="flex items-center justify-center w-full mt-10">
            <div className="size-5 fill-[#4977ec] dark:text-[#a2bdff]">
                {icons.loading}
            </div>
        </div>
    ) : (
        <div className="min-h-screen bg-gray-100 p-4 md:p-6">
            <section className="w-full bg-white shadow-sm rounded-xl p-6 mb-8 h-fit">
                <div className="">
                    <div className="">
                        <div className="flex justify-between gap-6 items-center">
                            <h2 className="text-2xl font-bold text-gray-800 mb-3">
                                Kitchen Summary
                            </h2>
                            <p className="text-sm md:text-base font-medium w-fit text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg">
                                <span className="font-semibold text-blue-600">
                                    {user.hostelType}
                                    {user.hostelNumber}
                                </span>{' '}
                                - {user.hostelName}
                            </p>
                        </div>
                        <p className="text-gray-500">
                            Aggregated items for preparation, better kitchen
                            management
                        </p>
                    </div>
                </div>
            </section>

            {/* orders */}
            {kitchenOrders.length > 0 ? (
                <section className="p-4 overflow-scroll bg-white rounded-xl shadow-sm flex flex-col md:flex-row md:gap-0 gap-6">
                    {/* summary */}
                    <section className="md:pr-4 p-2 w-full md:w-[70%] border-b-[0.01rem] md:border-r-[0.01rem] md:border-b-0 border-gray-200">
                        <h2 className="text-center font-bold text-xl mb-6">
                            Summary
                        </h2>
                        <div className="flex flex-wrap justify-center gap-4 mb-7 md:mb-0">
                            {Object.entries(summary).map(([name, quantity]) => (
                                <div
                                    key={name}
                                    className="border-[0.01rem] w-[120px] rounded-xl border-gray-200 p-4 flex flex-col items-center justify-center gap-3"
                                >
                                    <h3 className="font-semibold text-gray-900 text-lg truncate max-w-[120px]">
                                        {name}
                                    </h3>
                                    <div className="bg-[#4977ec]/10 text-[#4977ec] flex items-center justify-center size-[30px] rounded-full font-bold text-sm">
                                        {quantity}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* users wise */}
                    <section className="w-full md:w-[30%] md:ml-2 p-2">
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
                    No Items to Prepare, Chill
                </p>
            )}
        </div>
    );
}

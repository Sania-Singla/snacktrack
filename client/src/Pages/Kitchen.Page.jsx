import { useEffect, useState } from 'react';
import { userService } from '../Services';
import { useNavigate } from 'react-router-dom';
import { Button, Dropdown, OrderDropdown } from '../Components';
import { icons } from '../Assets/icons';
import toast from 'react-hot-toast';
import { getRollNo } from '../Utils';

export default function KitchenPage() {
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [key, setKey] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [showKey, setShowKey] = useState(false);
    const [hostel, setHostel] = useState({});
    const [hostels, setHostels] = useState([
        { value: '', label: 'Select Hostel' },
    ]);
    const [status, setStatus] = useState('');
    const [statusOptions, setStatusOptions] = useState([
        { value: '', label: 'Pending' },
        { value: 'Preparing', label: 'Preparing' },
        { value: 'Prepared', label: 'Prepared' },
        { value: 'Rejected', label: 'Rejected' },
    ]);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        (async function getOrders() {
            try {
                const res = await userService.getOrders();
                if (res) {
                    if (res.message) {
                        const data = await userService.getCanteens(signal);
                        if (data) {
                            setHostels((prev) => [
                                ...prev,
                                ...data.map((h) => ({
                                    label: `${h.hostelType}${h.hostelNumber}-${h.hostelName}`,
                                    value: h,
                                })),
                            ]);
                            setError(true);
                        }
                    } else setOrders(res);
                }
            } catch (err) {
                console.log(err);
                navigate('/server-error');
            } finally {
                setLoading(false);
            }
        })();
        return () => controller.abort();
    }, []);

    const verifyKey = async () => {
        if (!key || !hostel) return;
        setVerifying(true);
        try {
            const res = await userService.getOrders(
                `${hostel.hostelType}${hostel.hostelNumber}-${key}`
            );
            if (res && !res.message) {
                setError(false);
                setOrders(res);
            } else toast.error('Please Enter a Valid Key');
        } catch (err) {
            navigate('/server-error');
        } finally {
            setVerifying(false);
        }
    };

    function processOrders() {
        const individualItems = [],
            itemSummary = {};

        orders.forEach(({ student: { fullName, userName }, items, _id }) => {
            items.forEach(
                ({
                    price,
                    quantity,
                    itemType,
                    name,
                    itemId,
                    specialInstructions,
                }) => {
                    if (itemType === 'Snack') {
                        // for left side
                        individualItems.push({
                            orderId: _id,
                            itemId,
                            fullName,
                            rollNo: getRollNo(userName),
                            itemName: name,
                            quantity,
                            price,
                            specialInstructions:
                                specialInstructions ||
                                'No special instructions',
                        });

                        // for right side
                        itemSummary[name]
                            ? (itemSummary[name].quantity += quantity)
                            : (itemSummary[name] = { quantity });
                    }
                }
            );
        });

        return { individualItems, itemSummary };
    }

    const { individualItems, itemSummary } = processOrders();

    return loading ? (
        <div>loading...</div>
    ) : error ? (
        // verify staff key
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="sm:px-8 drop-shadow-md relative w-[350px] sm:w-[450px] transition-all duration-300 bg-white rounded-xl text-black p-5 flex flex-col items-center justify-center gap-4">
                <p className="text-2xl font-bold text-center mb-2">
                    Verify Kitchen Key
                </p>
                <p className="text-[15px] text-gray-600 text-center mb-3">
                    Enter the Kitchen Secret key to navigate to control panel
                </p>

                <div className="w-full flex justify-center mb-4">
                    <Dropdown options={hostels} setValue={setHostel} />
                </div>

                <div className="relative flex items-center w-full justify-center mb-3">
                    <input
                        type={showKey ? 'text' : 'password'}
                        value={key}
                        autoFocus
                        onChange={(e) => setKey(e.target.value)}
                        className="w-full text-xl text-center border-[0.01rem] indent-3 pr-12 rounded-md py-[5px] border-gray-600 focus:border-[#4977ec] focus:outline-none"
                    />
                    <div
                        onClick={() => setShowKey((prev) => !prev)}
                        className="size-[20px] absolute right-3 top-[50%] transform translate-y-[-50%] cursor-pointer fill-gray-700"
                    >
                        {showKey ? icons.eyeOff : icons.eye}
                    </div>
                </div>

                <Button
                    btnText={
                        verifying ? (
                            <div className="flex items-center justify-center w-full">
                                <div className="size-5 fill-[#4977ec] dark:text-[#a2bdff]">
                                    {icons.loading}
                                </div>
                            </div>
                        ) : (
                            'Verify'
                        )
                    }
                    onClick={verifyKey}
                    disabled={!key}
                    className="text-white rounded-md py-2 h-[40px] flex items-center justify-center text-lg w-full bg-[#4977ec] hover:bg-[#3b62c2]"
                />
            </div>
        </div>
    ) : (
        // Orders
        <div className="min-h-screen bg-gray-100 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        Kitchen Orders
                    </h1>
                    <p className="bg-[#4977ec]/10 text-[#4977ec] px-3 py-1 rounded-full text-sm font-medium">
                        {orders.length}{' '}
                        {orders.length === 1 ? 'Order' : 'Orders'}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Individual Orders Column */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="p-4 border-b border-gray-200 text-center">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Order Details
                            </h2>
                            <p className="text-sm text-gray-500">
                                Individual items from each order
                            </p>
                        </div>
                        <div className="divide-y divide-gray-200 max-h-[calc(100vh-220px)] overflow-y-auto">
                            {individualItems.length > 0 ? (
                                individualItems.map(
                                    (
                                        {
                                            orderId,
                                            itemId,
                                            fullName,
                                            rollNo,
                                            itemName,
                                            quantity,
                                            specialInstructions,
                                        },
                                        i
                                    ) => (
                                        <div
                                            key={orderId + itemId}
                                            className="p-4 hover:bg-gray-50 transition-colors flex flex-col gap-2"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-gray-900">
                                                        {fullName}
                                                    </span>
                                                    <span className="text-xs text-gray-600">
                                                        Roll No: {rollNo}
                                                    </span>
                                                </div>
                                                <div className="text-right flex gap-2">
                                                    <span className="text-gray-800">
                                                        {itemName}
                                                    </span>
                                                    <span className="font-bold text-[#4977ec] block">
                                                        × {quantity}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between gap-4">
                                                <p className="text-sm text-gray-500 mt-1 italic">
                                                    {specialInstructions}
                                                </p>

                                                <div className="w-fit">
                                                    <OrderDropdown
                                                        options={statusOptions}
                                                        setValue={setStatus}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )
                            ) : (
                                <div className="p-4 text-center text-gray-500">
                                    No individual orders found
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Item Summary Column */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="p-4 border-b border-gray-200 text-center">
                            <h2 className="text-xl font-semibold text-gray-800">
                                Kitchen Summary
                            </h2>
                            <p className="text-sm text-gray-500">
                                Aggregated items for preparation
                            </p>
                        </div>
                        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[calc(100vh-220px)] overflow-y-auto">
                            {Object.entries(itemSummary).length > 0 ? (
                                Object.entries(itemSummary).map(
                                    ([itemName, itemData]) => (
                                        <div
                                            key={itemName}
                                            className="bg-gray-50 rounded-lg p-3 border border-gray-200 hover:border-[#4977ec]/50 transition-colors"
                                        >
                                            <div className="flex gap-4 flex-col items-center text-center">
                                                <h3 className="font-semibold text-lg text-gray-900 truncate w-full">
                                                    {itemName}
                                                </h3>
                                                <div className="bg-[#4977ec]/10 text-[#4977ec] flex items-center justify-center size-[40px] rounded-full font-bold">
                                                    {itemData.quantity}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                )
                            ) : (
                                <div className="col-span-full p-4 text-center text-gray-500">
                                    No items summary available
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

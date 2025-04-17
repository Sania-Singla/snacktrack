import { useEffect, useState } from 'react';
import { Button, EmptyCart } from '../Components';
import { useNavigate } from 'react-router-dom';
import { icons } from '../Assets/icons';
import { PER_ITEM_PACKAGING_CHARGES, TAX } from '../Constants/constants';
import { orderService } from '../Services';
import {
    usePopupContext,
    useSocketContext,
    useStudentContext,
    useUserContext,
} from '../Contexts';
import { checkTokenExpired } from '../Utils';

export default function CartPage() {
    const [ordering, setOrdering] = useState(false);
    const navigate = useNavigate();
    const { socket } = useSocketContext();
    const { setShowPopup, setPopupInfo } = usePopupContext();
    const { cartItems, setCartItems } = useStudentContext();
    const [loading, setLoading] = useState(true);
    const { setUser } = useUserContext();

    async function checkAvailability() {
        try {
            const res = await orderService.checkAvailability(cartItems);
            if (res && !res.message) {
                const updatedCartItems = cartItems.map((item) => {
                    const foundItem = res.find(
                        (i) => i._id === item._id && i.price === item.price
                    );

                    if (item.type === 'Snack') {
                        return { ...item, isAvailable: !!foundItem };
                    } else {
                        return {
                            ...item,
                            availableCount: foundItem?.availableCount || 0,
                        };
                    }
                });
                setCartItems(updatedCartItems);
                return updatedCartItems;
            } else checkTokenExpired(res, setUser);
        } catch (err) {
            navigate('/server-error');
        }
    }

    useEffect(() => {
        (async function () {
            setLoading(true);
            await checkAvailability();
            setLoading(false);
        })();
    }, []);

    // Calculate charges
    const subtotal = cartItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
    );
    const packingCharges = cartItems.reduce(
        (acc, item) =>
            acc +
            (item.isPacked ? PER_ITEM_PACKAGING_CHARGES * item.quantity : 0),
        0
    );

    const tax = (subtotal + packingCharges) * TAX; // 5% tax on subtotal + packing
    const total = subtotal + packingCharges + tax;

    function updateQuantity(item, newQuantity) {
        const { _id, price } = item;
        const updatedCartItems = cartItems.map((item) =>
            item._id === _id && item.price === price
                ? { ...item, quantity: newQuantity }
                : item
        );
        // update local storage
        localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
        // update state
        setCartItems(updatedCartItems);
    }

    function removeFromCart(item) {
        const { _id, price, type } = item;
        const updatedCartItems = cartItems.filter((item) => {
            if (type === 'Snack') {
                return item._id !== _id;
            } else {
                return !(item._id === _id && item.price === price);
            }
        });
        // update local storage
        localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
        // update state
        setCartItems(updatedCartItems);
    }

    async function placeOrder() {
        try {
            setOrdering(true);
            const items = await checkAvailability();
            const hasUnavailableItems = items.some((i) => {
                if (i.type === 'Snack') {
                    return !i.isAvailable;
                } else {
                    return i.quantity > i.availableCount;
                }
            });
            if (hasUnavailableItems) {
                setShowPopup(true);
                setPopupInfo({ type: 'orderUnavailable' });
                return;
            }
            const res = await orderService.placeOrder(
                cartItems,
                total,
                packingCharges
            );
            if (res && !res.message) {
                let count = 0;
                cartItems.forEach((i) => (count += i.quantity));
                setShowPopup(true);
                setPopupInfo({ type: 'orderPlaced', count });
                localStorage.removeItem('cartItems');
                setCartItems([]);
                socket.emit('newOrder', res);
            } else checkTokenExpired(res, setUser);
        } catch (err) {
            navigate('/server-error');
        } finally {
            setOrdering(false);
        }
    }

    function editItem(item) {
        setShowPopup(true);
        setPopupInfo({ type: 'editCartItem', item });
    }

    const cartItemElements = cartItems.map((item) => {
        const {
            price,
            _id,
            name,
            category,
            type,
            image,
            quantity,
            isPacked,
            isAvailable,
            availableCount,
        } = item;

        const isUnavailable =
            type === 'Snack' ? !isAvailable : availableCount < quantity;

        return (
            <div
                key={`${_id}-${price}`}
                className="w-full flex flex-col sm:flex-row items-end px-3 sm:items-center justify-between border-b border-gray-200 py-4 relative"
            >
                {/* Gray overlay for unavailable items */}
                {isUnavailable && (
                    <>
                        <div className="absolute inset-0 bg-gray-300 opacity-50 rounded-lg pointer-events-none"></div>
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="bg-white px-2 py-1 rounded-md text-sm font-medium text-red-600 shadow-sm">
                                {type === 'Snack'
                                    ? 'Not Available'
                                    : `Only ${availableCount} left`}
                            </span>
                        </div>
                    </>
                )}

                <div className="w-full flex items-center gap-4 justify-between">
                    <div className="flex items-center gap-4">
                        {/* image */}
                        <div className="size-[50px] overflow-hidden border-[0.01rem] border-gray-400 rounded-lg flex items-center justify-center">
                            {type === 'Snack' ? (
                                <img
                                    src={image}
                                    alt={`${name} image`}
                                    className="object-cover size-full"
                                />
                            ) : (
                                <div className="size-5 text-gray-400">
                                    {icons.soda}
                                </div>
                            )}
                        </div>
                        {/* info */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">
                                {name || category}
                            </h3>
                            <p className="text-sm text-gray-500">
                                ₹{price.toFixed(2)}
                                {isPacked && (
                                    <span className="text-xs text-gray-500 ml-1">
                                        (+₹5 packing)
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="sm:hidden flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <Button
                            className="px-3 py-1 text-gray-500 hover:bg-gray-100"
                            onClick={() =>
                                quantity === 1
                                    ? removeFromCart(item)
                                    : updateQuantity(item, quantity - 1)
                            }
                            btnText="-"
                        />
                        <span className="px-3 py-1 text-gray-900">
                            {quantity}
                        </span>
                        <Button
                            className="px-3 py-1 text-gray-500 hover:bg-gray-100"
                            onClick={() => updateQuantity(item, quantity + 1)}
                            btnText="+"
                        />
                    </div>
                </div>

                {/* price & quantity */}
                <div className="flex items-center space-x-4 mt-3 sm:mt-0">
                    <div className="hidden sm:flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <Button
                            className="px-3 py-1 text-gray-500 hover:bg-gray-100"
                            onClick={() =>
                                quantity === 1
                                    ? removeFromCart(item)
                                    : updateQuantity(item, quantity - 1)
                            }
                            btnText="-"
                        />
                        <span className="px-3 py-1 text-gray-900">
                            {quantity}
                        </span>
                        <Button
                            className="px-3 py-1 text-gray-500 hover:bg-gray-100"
                            onClick={() => updateQuantity(item, quantity + 1)}
                            btnText="+"
                        />
                    </div>
                    <div className="flex items-center gap-1">
                        <p className="text-lg font-semibold mr-1 text-gray-900">
                            ₹
                            {(
                                price * quantity +
                                (isPacked ? 5 * quantity : 0)
                            ).toFixed(2)}
                        </p>
                        <Button
                            btnText={
                                <div className="size-[18px] fill-[#4977ec]">
                                    {icons.edit}
                                </div>
                            }
                            className="hover:bg-gray-100 p-2 rounded-full"
                            onClick={() => editItem(item)}
                        />
                        <Button
                            btnText={
                                <div className="size-[18px] fill-red-600">
                                    {icons.delete}
                                </div>
                            }
                            className="hover:bg-gray-100 p-2 rounded-full"
                            onClick={() => removeFromCart(item)}
                        />
                    </div>
                </div>
            </div>
        );
    });

    return loading ? (
        <div className="flex justify-center py-12">
            <div className="size-[25px] fill-[#4977ec] dark:text-[#a2bdff]">
                {icons.loading}
            </div>
        </div>
    ) : cartItems.length > 0 ? (
        <div className="bg-gray-100 rounded-xl drop-shadow-sm w-full py-10 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Product List */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-md pb-3">
                    <h2 className="text-xl font-semibold text-gray-900 p-6">
                        Cart Items
                    </h2>
                    <div className="px-3">{cartItemElements}</div>
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        Order Summary
                    </h2>
                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <p className="text-gray-600">Subtotal</p>
                            <p className="text-gray-900">
                                ₹{subtotal.toFixed(2)}
                            </p>
                        </div>
                        <div className="flex justify-between">
                            <p className="text-gray-600">Packing Charges</p>
                            <p className="text-gray-900">
                                ₹{packingCharges.toFixed(2)}
                            </p>
                        </div>
                        <div className="flex justify-between">
                            <p className="text-gray-600">Tax (5%)</p>
                            <p className="text-gray-900">₹{tax.toFixed(2)}</p>
                        </div>
                        <div className="border-t border-gray-200 pt-4">
                            <div className="flex justify-between">
                                <p className="text-lg font-semibold text-gray-900">
                                    Total
                                </p>
                                <p className="text-lg font-semibold text-gray-900">
                                    ₹{total.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                    <Button
                        onClick={placeOrder}
                        className="text-white rounded-md py-2 mt-4 h-[40px] flex items-center justify-center w-full bg-[#4977ec] hover:bg-[#3b62c2]"
                        btnText={
                            ordering ? (
                                <div className="size-5 fill-[#4977ec] dark:text-[#a2bdff]">
                                    {icons.loading}
                                </div>
                            ) : (
                                'Place Order'
                            )
                        }
                    />
                    <Button
                        className="text-black rounded-md py-2 mt-4 h-[40px] flex items-center justify-center w-full bg-gray-100 border-[0.01rem] border-transparent hover:border-black hover:bg-gray-200"
                        btnText="Continue Shopping"
                        onClick={() => navigate('/')}
                    />
                </div>
            </div>
        </div>
    ) : (
        <EmptyCart />
    );
}

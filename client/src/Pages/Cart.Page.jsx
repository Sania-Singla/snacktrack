import { useEffect, useState } from 'react';
import { Button, EmptyCart } from '../Components';
import { useNavigate } from 'react-router-dom';
import { icons } from '../Assets/icons';
import { SNACK_PLACEHOLDER_IMAGE } from '../Constants';
import { orderService } from '../Services';
import {
    usePopupContext,
    useStudentContext,
    useUserContext,
} from '../Contexts';
import { checkTokenExpired } from '../Utils';
import toast from 'react-hot-toast';

export default function CartPage() {
    const [ordering, setOrdering] = useState(false);
    const navigate = useNavigate();
    const { setShowPopup, setPopupInfo } = usePopupContext();
    const { cartItems, setCartItems, setOrderPlaced } = useStudentContext();
    const [loading, setLoading] = useState(true);
    const { user, setUser } = useUserContext();

    async function checkAvailability() {
        try {
            const res = await orderService.checkAvailability(cartItems);
            if (res && !res.message) {
                const updatedCartItems = cartItems.map((item) => {
                    const foundItem = res.find(
                        (i) => i._id === item._id && i.price === item.price
                    );
                    return { ...item, isAvailable: !!foundItem };
                });
                setCartItems(updatedCartItems);
                return updatedCartItems;
            } else checkTokenExpired(res, setUser);
        } catch (err) {
            toast.error('Something went wrong. Please try again.');
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

    function updateQuantity(item, newQuantity) {
        const { _id } = item;
        const updatedCartItems = cartItems.map((i) =>
            i._id === _id ? { ...i, quantity: newQuantity } : i
        );
        localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
        setCartItems(updatedCartItems);
    }

    function removeFromCart(item) {
        const { _id } = item;
        const updatedCartItems = cartItems.filter((i) => i._id !== _id);
        localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
        setCartItems(updatedCartItems);
    }

    async function placeOrder() {
        try {
            if (ordering) return;
            setOrdering(true);
            const items = await checkAvailability();
            const hasUnavailableItems = items.some((i) => !i.isAvailable);
            if (hasUnavailableItems) {
                setShowPopup(true);
                setPopupInfo({ type: 'orderUnavailable' });
                return;
            }
            const res = await orderService.placeOrder({
                cartItems,
                amount: subtotal,
            });
            if (res && res.message === 'canteen is closed') {
                toast.error('Canteen is currently closed');
            } else if (res && !res.message) {
                localStorage.removeItem('cartItems');
                let count = 0;
                cartItems.forEach((i) => (count += i.quantity));
                setCartItems([]);
                setOrderPlaced(true);
                setShowPopup(true);
                setPopupInfo({ type: 'orderPlaced', count });
            } else checkTokenExpired(res, setUser);
        } catch (err) {
            toast.error('Something went wrong. Please try again.');
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
            type,
            image,
            quantity,
            isAvailable,
            specialInstructions,
        } = item;

        const isUnavailable = type === 'Snack' && !isAvailable;

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
                                Not Available
                            </span>
                        </div>
                    </>
                )}

                <div className="w-full flex items-center gap-4 justify-between">
                    <div className="flex items-center gap-4">
                        {/* image */}
                        <div className="size-[40px] bg-gray-50 overflow-hidden border-1 border-gray-300 rounded-lg flex items-center justify-center">
                            {type === 'Snack' ? (
                                <img
                                    src={image || SNACK_PLACEHOLDER_IMAGE}
                                    alt={`${name} image`}
                                    className="object-cover size-full"
                                />
                            ) : (
                                <div className="size-5 stroke-gray-300">
                                    {icons.soda}
                                </div>
                            )}
                        </div>
                        {/* info */}
                        <div className="space-y-[2px]">
                            <h3 className="font-medium text-gray-900">
                                {name}
                            </h3>
                            {specialInstructions && (
                                <p className="text-xs text-red-600 italic">
                                    <span className="font-medium">Note: </span>
                                    <span>{specialInstructions}</span>
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="sm:hidden flex items-center border-1 border-gray-300 rounded-md overflow-hidden">
                        <Button
                            className="px-3 py-1 text-gray-500 hover:bg-gray-100 font-medium"
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
                            className="px-3 py-1 text-gray-500 hover:bg-gray-100 font-medium"
                            onClick={() => updateQuantity(item, quantity + 1)}
                            btnText="+"
                        />
                    </div>
                </div>

                {/* price & quantity */}
                <div className="flex items-center space-x-4 mt-3 sm:mt-0">
                    <div className="hidden sm:flex items-center border-1 border-gray-300 rounded-md overflow-hidden">
                        <Button
                            className="px-3 py-1 text-gray-500 hover:bg-gray-100 font-medium"
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
                            className="px-3 py-1 text-gray-500 hover:bg-gray-100 font-medium"
                            onClick={() => updateQuantity(item, quantity + 1)}
                            btnText="+"
                        />
                    </div>
                    <div className="flex items-center gap-1">
                        {item.type === 'Snack' ? (
                            <Button
                                btnText={
                                    <div className="size-4 fill-[#4977ec]">
                                        {icons.edit}
                                    </div>
                                }
                                className="hover:bg-gray-100 p-2 rounded-full"
                                onClick={() => editItem(item)}
                            />
                        ) : (
                            <div className="size-8"></div>
                        )}
                        <Button
                            btnText={
                                <div className="size-4 fill-red-600">
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
        <div className="w-full py-2 px-2 sm:px-6">
            <h1 className="text-xl font-semibold text-gray-900 mb-8">
                Your Cart
            </h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Product List */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold text-gray-900 px-6 pt-6 pb-4">
                        Cart Items
                    </h2>
                    <div className="px-3">{cartItemElements}</div>
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-lg shadow-sm p-5">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        Order Summary
                    </h2>
                    <div className="space-y-4">
                        <div className="flex justify-between text-gray-800">
                            <p>Subtotal</p>
                            <p>₹{subtotal.toFixed(2)}</p>
                        </div>
                        <div className="text-center italic text-sm border-1 rounded-md p-2 border-red-300 text-red-900">
                            <p className="flex-1">
                                <span className="font-medium">Note - </span>
                                Extra charges may apply based on special
                                instructions.
                            </p>
                        </div>
                        <div className="border-t border-gray-200 pt-4">
                            <div className="flex justify-between">
                                <p className="text-lg font-semibold text-gray-900">
                                    Total
                                </p>
                                <p className="text-lg font-semibold text-gray-900">
                                    ₹{subtotal.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-center w-full gap-4 mt-4">
                        <Button
                            onClick={placeOrder}
                            disabled={ordering || !user.isOpen}
                            className="text-white rounded-md py-2 h-[40px] flex items-center justify-center w-full bg-[#4977ec] hover:bg-[#3b62c2]"
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
                            className="text-black rounded-md py-2 h-[40px] flex items-center justify-center w-full bg-gray-100 border-1 border-gray-300 hover:bg-gray-200"
                            btnText="Add More"
                            onClick={() => navigate('/')}
                        />
                    </div>
                </div>
            </div>
        </div>
    ) : (
        <EmptyCart />
    );
}

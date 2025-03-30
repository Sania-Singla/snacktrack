import { useState } from 'react';
import { Button, EmptyCart } from '../Components';
import { useNavigate } from 'react-router-dom';
import { icons } from '../Assets/icons';
import { SNACK_PLACEHOLDER_IMAGE } from '../Constants/constants';
import { orderService } from '../Services';
import { usePopupContext } from '../Contexts';

export default function CartPage() {
    const [ordering, setOrdering] = useState(false);
    const navigate = useNavigate();
    const { setShowPopup, setPopupInfo } = usePopupContext();
    const [cartItems, setCartItems] = useState(
        JSON.parse(localStorage.getItem('cartItems')) || []
    );

    const subtotal = cartItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
    );
    const tax = subtotal * 0.05; // 5% tax
    const total = subtotal + tax;

    function updateQuantity(itemId, price, newQuantity) {
        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        const updatedCartItems = cartItems.map((item) =>
            item._id === itemId && item.price === price
                ? { ...item, quantity: newQuantity }
                : item
        );
        localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
        setCartItems(updatedCartItems);
    }

    function removeFromCart(itemId, price, type) {
        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];

        const updatedCartItems = cartItems.filter((item) => {
            if (type === 'Snack') {
                return item._id !== itemId;
            } else {
                return !(item._id === itemId && item.price === price);
            }
        });

        localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
        setCartItems(updatedCartItems);
    }

    async function placeOrder() {
        try {
            setOrdering(true);
            const cartItems =
                JSON.parse(localStorage.getItem('cartItems')) || [];
            const res = await orderService.placeOrder(cartItems, total);
            if (res && !res.message) {
                setShowPopup(true);
                setPopupInfo({
                    type: 'orderPlaced',
                    data: { itemsCount: cartItems.length },
                });
                localStorage.removeItem('cartItems');
                setCartItems([]);
            }
        } catch (err) {
            navigate('/server-error');
        } finally {
            setOrdering(false);
        }
    }

    const cartItemElements = cartItems.map(
        ({ price, _id, name, category, type, image, quantity }) => (
            <div
                key={`${_id}-${price}`}
                className="w-full flex flex-col sm:flex-row items-end sm:items-center justify-between border-b border-gray-200 py-4"
            >
                <div className="w-full flex items-center gap-4 justify-between">
                    <div className="flex items-center gap-4">
                        {/* image */}
                        <div className="size-[50px] overflow-hidden border rounded-lg flex items-center justify-center">
                            <img
                                src={image || SNACK_PLACEHOLDER_IMAGE}
                                alt={`${name || category} image`}
                                className="object-cover size-full"
                            />
                        </div>
                        {/* info */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">
                                {name || category}
                            </h3>
                            <p className="text-sm text-gray-500">
                                ₹{price.toFixed(2)}
                            </p>
                        </div>
                    </div>

                    <div className="sm:hidden flex items-center border border-gray-300 rounded-lg overflow-hidden">
                        <Button
                            className="px-3 py-1 text-gray-500 hover:bg-gray-100"
                            onClick={() =>
                                quantity === 1
                                    ? removeFromCart(_id, price, type)
                                    : updateQuantity(_id, price, quantity - 1)
                            }
                            btnText="-"
                        />
                        <span className="px-3 py-1 text-gray-900">
                            {quantity}
                        </span>
                        <Button
                            className="px-3 py-1 text-gray-500 hover:bg-gray-100"
                            onClick={() =>
                                updateQuantity(_id, price, quantity + 1)
                            }
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
                                    ? removeFromCart(_id, price, type)
                                    : updateQuantity(_id, price, quantity - 1)
                            }
                            btnText="-"
                        />
                        <span className="px-3 py-1 text-gray-900">
                            {quantity}
                        </span>
                        <Button
                            className="px-3 py-1 text-gray-500 hover:bg-gray-100"
                            onClick={() =>
                                updateQuantity(_id, price, quantity + 1)
                            }
                            btnText="+"
                        />
                    </div>
                    <div className="flex items-center gap-1">
                        <p className="text-lg font-semibold mr-1 text-gray-900">
                            ₹{(price * quantity).toFixed(2)}
                        </p>
                        <Button
                            btnText={
                                <div className="size-[18px] fill-red-600">
                                    {icons.delete}
                                </div>
                            }
                            className="hover:bg-gray-100 p-2 rounded-full"
                            onClick={() => removeFromCart(_id, price, type)}
                        />
                        <Button
                            btnText={
                                <div className="size-[18px] fill-[#4977ec]">
                                    {icons.edit}
                                </div>
                            }
                            className="hover:bg-gray-100 p-2 rounded-full"
                            onClick={() => editItem(_id, price, type)}
                        />
                    </div>
                </div>
            </div>
        )
    );

    return cartItems.length > 0 ? (
        <div className="bg-gray-100 rounded-xl drop-shadow-sm w-full py-10 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Product List */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Cart Items
                    </h2>
                    {cartItemElements}
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

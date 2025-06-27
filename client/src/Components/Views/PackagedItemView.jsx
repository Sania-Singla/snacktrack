import toast from 'react-hot-toast';
import { Button } from '..';
import { icons } from '../../Assets/icons';
import {
    usePopupContext,
    useSnackContext,
    useStudentContext,
    useUserContext,
} from '../../Contexts';
import { useEffect, useState } from 'react';
import { contractorService } from '../../Services';
import { useNavigate } from 'react-router-dom';
import { checkTokenExpired } from '../../Utils';

export default function PackagedItemView({ item, reference }) {
    const { _id, name, isAvailable, price } = item;
    const [quantityInCart, setQuantityInCart] = useState(item.quantity);
    const { user } = useUserContext();
    const { setShowPopup, setPopupInfo } = usePopupContext();
    const { cartItems, setCartItems } = useStudentContext();
    const { setItems } = useSnackContext();
    const navigate = useNavigate();

    async function toggleAvailability() {
        try {
            const res = await contractorService.toggleItemAvailability(_id);
            if (
                res &&
                res.message === 'item availability toggled successfully'
            ) {
                setItems((prev) =>
                    prev.map((s) =>
                        s._id === _id ? { ...s, isAvailable: !isAvailable } : s
                    )
                );
            } else checkTokenExpired(res, setUser);
        } catch (err) {
            navigate('/server-error');
        }
    }

    function editItem() {
        setShowPopup(true);
        setPopupInfo({ type: 'editItem', item });
    }

    function removeItem() {
        setShowPopup(true);
        setPopupInfo({ type: 'removeItem', item });
    }

    useEffect(() => setQuantityInCart(item.quantity), [item]);

    function addToCart() {
        setQuantityInCart(1);
        const newCartItem = {
            ...item,
            type: 'PackagedFood',
            quantity: 1,
            isPacked: false,
        };
        localStorage.setItem(
            'cartItems',
            JSON.stringify(cartItems.concat(newCartItem))
        );
        setCartItems((prev) => prev.concat(newCartItem));
        toast.success('Added to cart');
    }

    function updateQuantity(newQuantity) {
        const updatedCartItems = cartItems.map((i) =>
            i._id === _id ? { ...i, quantity: newQuantity } : i
        );
        localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
        setCartItems(updatedCartItems);
        setQuantityInCart(newQuantity);
    }

    function removeFromCart() {
        const updatedCartItems = cartItems.filter((i) => i._id !== _id);
        localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
        setCartItems(updatedCartItems);
        setQuantityInCart(0);
    }

    return (
        <div
            ref={reference}
            className="p-4 relative bg-white shadow-sm transition-all hover:shadow-md rounded-2xl overflow-hidden cursor-pointer"
        >
            {user.role === 'contractor' && (
                <div className="absolute right-4 top-4 flex gap-3 justify-end">
                    <Button
                        btnText={
                            <div className="size-[15px] group-hover:fill-[#4977ec]">
                                {icons.edit}
                            </div>
                        }
                        className="bg-[#f0efef] p-2 group rounded-full shadow-sm hover:bg-[#ebeaea]"
                        onClick={editItem}
                    />
                    <div>
                        <Button
                            btnText={
                                <div className="size-[15px] group-hover:fill-red-700">
                                    {icons.delete}
                                </div>
                            }
                            className="bg-[#f0efef] p-2 group rounded-full shadow-sm hover:bg-[#ebeaea]"
                            onClick={removeItem}
                        />
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="flex flex-col gap-3 w-full">
                <div className="flex justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <p className="text-xl font-bold text-gray-900 truncate">
                            {name}
                        </p>

                        <div className="flex items-center gap-1 bg-gray-100 shadow-sm rounded-full px-3 py-1">
                            <div
                                className={`size-[6px] rounded-full ${isAvailable ? 'bg-green-600' : 'bg-red-500'}`}
                            />
                            <span
                                className={`text-sm font-semibold ${isAvailable ? 'text-green-600' : 'text-red-600'}`}
                            >
                                {isAvailable ? 'Available' : 'UnAvailable'}
                            </span>
                        </div>
                    </div>

                    {user.role === 'student' && (
                        <p className="text-sm font-bold bg-gray-100 shadow-sm rounded-full px-3 py-1">
                            Rs. {price}
                        </p>
                    )}
                </div>

                {/* Add to Cart Button or Toggle Switch */}
                <div className="w-full flex items-center justify-between gap-4">
                    {user.role === 'contractor' && (
                        <p className="text-sm font-bold bg-gray-100 shadow-sm rounded-full px-3 py-1">
                            Rs. {price}
                        </p>
                    )}

                    {user.role !== 'contractor' ? (
                        isAvailable && (
                            <div className="mt-6 w-full flex items-center justify-end">
                                {quantityInCart > 0 ? (
                                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                        <Button
                                            className="px-3 py-1 text-gray-500 hover:bg-gray-100"
                                            onClick={() =>
                                                quantityInCart === 1
                                                    ? removeFromCart()
                                                    : updateQuantity(
                                                          quantityInCart - 1
                                                      )
                                            }
                                            btnText="-"
                                        />
                                        <span className="px-3 py-1 text-gray-900">
                                            {quantityInCart}
                                        </span>
                                        <Button
                                            className="px-3 py-1 text-gray-500 hover:bg-gray-100"
                                            onClick={() =>
                                                updateQuantity(
                                                    quantityInCart + 1
                                                )
                                            }
                                            btnText="+"
                                        />
                                    </div>
                                ) : (
                                    <Button
                                        btnText={
                                            <div className="flex items-center justify-center gap-2">
                                                <span>Add to Cart</span>
                                                <div className="size-4 fill-white">
                                                    {icons.plus}
                                                </div>
                                            </div>
                                        }
                                        onClick={addToCart}
                                        className="rounded-md px-3 py-[5px] text-white bg-[#4977ec] hover:bg-[#3b62c2] shadow-md"
                                    />
                                )}
                            </div>
                        )
                    ) : (
                        <div className="flex items-center justify-center mt-6">
                            <label
                                htmlFor={_id}
                                className="relative inline-flex items-center cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={isAvailable}
                                    id={_id}
                                    onChange={toggleAvailability}
                                />
                                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-[#4977ec] transition-colors duration-200" />
                                <div className="absolute left-1 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 peer-checked:translate-x-5" />
                            </label>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

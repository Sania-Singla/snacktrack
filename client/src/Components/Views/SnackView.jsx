import { useNavigate } from 'react-router-dom';
import { Button } from '..';
import { icons } from '../../Assets/icons';
import {
    usePopupContext,
    useSnackContext,
    useUserContext,
} from '../../Contexts';
import { contractorService } from '../../Services';
import { useState } from 'react';

export default function SnackView({ snack, reference }) {
    const { _id, image, name, price, info, isAvailable } = snack;
    const [quantityInCart, setQuantityInCart] = useState(snack.quantity);
    const { user } = useUserContext();
    const { setSnacks } = useSnackContext();
    const navigate = useNavigate();
    const { setShowPopup, setPopupInfo } = usePopupContext();

    async function toggleAvailability() {
        try {
            const res = await contractorService.toggleSnackAvailability(_id);
            if (
                res &&
                res.message === 'snack availability toggled successfully'
            ) {
                setSnacks((prev) =>
                    prev.map((snack) =>
                        snack._id === _id
                            ? { ...snack, isAvailable: !snack.isAvailable }
                            : snack
                    )
                );
            }
        } catch (err) {
            navigate('/server-error');
        }
    }

    function editSnack() {
        setShowPopup(true);
        setPopupInfo({ type: 'editSnack', target: snack });
    }

    function removeSnack() {
        setShowPopup(true);
        setPopupInfo({ type: 'removeSnack', target: snack });
    }

    function addToCart() {
        setQuantityInCart(1);
        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        const newCartItem = {
            _id,
            name,
            price,
            image,
            type: 'Snack',
            quantity: 1,
        };
        localStorage.setItem(
            'cartItems',
            JSON.stringify(cartItems.concat(newCartItem))
        );
    }

    function updateQuantity(newQuantity) {
        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        const updatedCartItems = cartItems.map((i) =>
            i._id === _id ? { ...i, quantity: newQuantity } : i
        );
        localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
        setQuantityInCart(newQuantity);
    }

    function removeFromCart() {
        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        const updatedCartItems = cartItems.filter((i) => i._id !== _id);
        localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
        setQuantityInCart(0);
    }

    return (
        <div
            ref={reference}
            className="p-4 relative cursor-pointer bg-white shadow-lg rounded-2xl overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl"
        >
            {user.role === 'contractor' && (
                <div className="absolute right-6 top-6 flex gap-3 justify-end">
                    <Button
                        btnText={
                            <div className="size-[18px] group-hover:fill-[#4977ec]">
                                {icons.edit}
                            </div>
                        }
                        className="bg-[#f0efef] p-[10px] group rounded-full drop-shadow-sm hover:bg-[#ebeaea]"
                        onClick={editSnack}
                    />
                    <div>
                        <Button
                            btnText={
                                <div className="size-[18px] group-hover:fill-red-700">
                                    {icons.delete}
                                </div>
                            }
                            className="bg-[#f0efef] p-[10px] group rounded-full drop-shadow-lg hover:bg-[#ebeaea]"
                            onClick={removeSnack}
                        />
                    </div>
                </div>
            )}

            {/* Image */}
            <div className="h-[180px] w-full rounded-xl overflow-hidden shadow-md">
                <img
                    alt="snack image"
                    src={image}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Content */}
            <div className="flex flex-col gap-3 w-full mt-4">
                {/* Availability and Price */}
                <div className="flex items-center justify-between">
                    {/* Availability */}
                    <div className="flex items-center gap-2 bg-gray-100 shadow-sm rounded-full px-3 py-1">
                        <div
                            className={`size-2 rounded-full ${isAvailable ? 'bg-green-600' : 'bg-red-500'}`}
                        />
                        <span
                            className={`text-sm font-semibold ${isAvailable ? 'text-green-600' : 'text-red-600'}`}
                        >
                            {isAvailable ? 'Available' : 'Not Available'}
                        </span>
                    </div>

                    {/* Price */}
                    <p className="text-sm font-bold bg-gray-100 shadow-sm rounded-full px-3 py-1">
                        Rs. {price}
                    </p>
                </div>

                {/* Name and Info */}
                <div className="flex flex-col gap-2">
                    {/* Name */}
                    <p className="text-xl font-bold text-gray-900 truncate">
                        {name}
                    </p>

                    {/* Info */}
                    {info && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                            {info} Lorem ipsum dolor sit amet, consectetur
                            adipisicing elit. Consequatur, quidem.
                        </p>
                    )}
                </div>

                {/* Add to Cart Button or Toggle Switch */}
                <div className="w-full flex items-center justify-end mt-2">
                    {user.role !== 'contractor' ? (
                        isAvailable &&
                        (quantityInCart > 0 ? (
                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                <Button
                                    className="px-3 py-1 text-gray-500 hover:bg-gray-100"
                                    onClick={() =>
                                        quantityInCart === 1
                                            ? removeFromCart()
                                            : updateQuantity(quantityInCart - 1)
                                    }
                                    btnText="-"
                                />
                                <span className="px-3 py-1 text-gray-900">
                                    {quantityInCart}
                                </span>
                                <Button
                                    className="px-3 py-1 text-gray-500 hover:bg-gray-100"
                                    onClick={() =>
                                        updateQuantity(quantityInCart + 1)
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
                                className="rounded-md px-3 py-[5px] text-white bg-[#4977ec] hover:bg-[#3b62c2] shadow-md transition-colors duration-300"
                            />
                        ))
                    ) : (
                        <div className="flex items-center justify-center">
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

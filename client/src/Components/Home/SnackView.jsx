import { Button } from '..';
import { icons } from '../../Assets/icons';
import {
    usePopupContext,
    useStudentContext,
    useUserContext,
} from '../../Contexts';
import { contractorService } from '../../Services';
import { useEffect, useState } from 'react';
import { checkTokenExpired } from '../../Utils';
import { SNACK_PLACEHOLDER_IMAGE } from '../../Constants';
import toast from 'react-hot-toast';

export default function SnackView({ snack, reference = null }) {
    const { _id, image, name, isAvailable, price } = snack;
    const [quantityInCart, setQuantityInCart] = useState(snack.quantity || 0);
    const { user, setUser } = useUserContext();
    const { setShowPopup, setPopupInfo } = usePopupContext();
    const { cartItems, setCartItems } = useStudentContext();

    async function toggleAvailability() {
        try {
            const res = await contractorService.toggleSnackAvailability(_id);
            if (
                res &&
                res.message === 'snack availability toggled successfully'
            ) {
                toast.success('Snack Availability Toggled');
            } else if (res && res.message !== 'tokens missing') {
                toast.error(res?.message);
            } else checkTokenExpired(res, setUser);
        } catch (err) {
            toast.error('Something went wrong. Please try again.');
        }
    }

    useEffect(() => setQuantityInCart(snack.quantity), [snack]);

    function editSnack() {
        setShowPopup(true);
        setPopupInfo({ type: 'editSnack', snack });
    }

    function removeSnack() {
        setShowPopup(true);
        setPopupInfo({ type: 'removeSnack', snack });
    }

    function addToCart() {
        setQuantityInCart(1);
        const newCartItem = {
            ...snack,
            type: 'Snack',
            quantity: 1,
            specialInstructions: '',
        };
        localStorage.setItem(
            'cartItems',
            JSON.stringify(cartItems.concat(newCartItem))
        );
        setCartItems((prev) => prev.concat(newCartItem));
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
            className={`${!isAvailable && user.role !== 'contractor' ? 'brightness-95 opacity-50' : 'hover:shadow-md'} p-3 flex flex-col shadow-xs border-1 border-gray-100 relative h-full bg-white transition-all rounded-lg overflow-hidden cursor-pointer`}
        >
            {/* Image */}
            <div className="flex gap-4">
                <div className="aspect-square w-[20%] min-w-20 rounded-lg overflow-hidden">
                    <img
                        alt="snack image"
                        src={image || SNACK_PLACEHOLDER_IMAGE}
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                    <div className="flex justify-between gap-4 items-center">
                        <div className="flex gap-1 items-center">
                            <p className="font-semibold text-lg text-gray-900">
                                {name}
                            </p>

                            {!isAvailable && (
                                <div className="flex items-center gap-1">
                                    <span className="text-gray-800">
                                        &bull;
                                    </span>
                                    <span className="font-medium text-red-600 text-sm">
                                        Unavailable
                                    </span>
                                </div>
                            )}
                        </div>

                        {user.role === 'contractor' && (
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
                                <div className="w-9 h-5 bg-gray-300 rounded-full peer peer-checked:bg-[#4977ec] transition-colors duration-200" />
                                <div className="absolute left-[3px] size-3.5 bg-white rounded-full shadow-sm transition-transform duration-200 peer-checked:translate-x-4" />
                            </label>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <p className="text-lg">
                            <span className="mr-1">₹</span>
                            {price}
                        </p>

                        {user.role === 'student' &&
                            isAvailable &&
                            (quantityInCart > 0 ? (
                                <div className="flex items-center h-full self-end w-fit border-1 border-gray-300 rounded-md overflow-hidden">
                                    <Button
                                        className="px-3 py-1 font-bold text-gray-500 hover:bg-gray-100"
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
                                        className="px-3 py-1 font-bold text-gray-500 hover:bg-gray-100"
                                        onClick={() =>
                                            updateQuantity(quantityInCart + 1)
                                        }
                                        btnText="+"
                                    />
                                </div>
                            ) : (
                                <Button
                                    btnText={
                                        <div className="size-4 fill-white">
                                            {icons.plus}
                                        </div>
                                    }
                                    onClick={addToCart}
                                    className="rounded-md size-8 flex self-end items-center justify-center text-white bg-[#4977ec] hover:bg-[#3b62c2] shadow-xs"
                                />
                            ))}

                        {user.role === 'contractor' && (
                            <div className="flex gap-2 justify-end">
                                <Button
                                    btnText={
                                        <div className="size-4 group-hover:stroke-[#4977ec] stroke-black fill-none">
                                            {icons.editUnfilled}
                                        </div>
                                    }
                                    className="bg-[#f0efef] p-1.5 group rounded-md shadow-xs hover:bg-[#ebeaea]"
                                    onClick={editSnack}
                                />
                                <div>
                                    <Button
                                        btnText={
                                            <div className="size-4 group-hover:fill-red-700">
                                                {icons.delete}
                                            </div>
                                        }
                                        className="bg-[#f0efef] p-1.5 group rounded-md shadow-xs hover:bg-[#ebeaea]"
                                        onClick={removeSnack}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

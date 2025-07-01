import { useNavigate } from 'react-router-dom';
import { Button } from '..';
import { icons } from '../../Assets/icons';
import {
    usePopupContext,
    useSnackContext,
    useStudentContext,
    useUserContext,
} from '../../Contexts';
import { contractorService } from '../../Services';
import { useEffect, useState } from 'react';
import { checkTokenExpired } from '../../Utils';

export default function SnackView({ snack, reference }) {
    const { _id, image, name, isAvailable } = snack;
    const [quantityInCart, setQuantityInCart] = useState(snack.quantity);
    const { user, setUser } = useUserContext();
    const { setSnacks } = useSnackContext();
    const navigate = useNavigate();
    const { setShowPopup, setPopupInfo } = usePopupContext();
    const { cartItems, setCartItems } = useStudentContext();

    async function toggleAvailability() {
        try {
            const res = await contractorService.toggleSnackAvailability(_id);
            if (
                res &&
                res.message === 'snack availability toggled successfully'
            ) {
                setSnacks((prev) =>
                    prev.map((s) =>
                        s._id === _id ? { ...s, isAvailable: !isAvailable } : s
                    )
                );
            } else checkTokenExpired(res, setUser);
        } catch (err) {
            navigate('/server-error');
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
            isPacked: false,
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
            className="p-4 relative bg-white shadow-sm transition-all hover:shadow-md rounded-2xl overflow-hidden cursor-pointer"
        >
            {user.role === 'contractor' && (
                <div className="absolute right-6 top-6 flex gap-3 justify-end">
                    <Button
                        btnText={
                            <div className="size-[15px] group-hover:fill-[#4977ec]">
                                {icons.edit}
                            </div>
                        }
                        className="bg-[#f0efef] p-2 group rounded-full shadow-sm hover:bg-[#ebeaea]"
                        onClick={editSnack}
                    />
                    <div>
                        <Button
                            btnText={
                                <div className="size-[15px] group-hover:fill-red-700">
                                    {icons.delete}
                                </div>
                            }
                            className="bg-[#f0efef] p-2 group rounded-full shadow-sm hover:bg-[#ebeaea]"
                            onClick={removeSnack}
                        />
                    </div>
                </div>
            )}

            {/* Image */}
            <div className="aspect-[5/3] w-full rounded-xl overflow-hidden shadow-sm">
                <img
                    alt="snack image"
                    src={image}
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Content */}
            <div className="flex flex-col w-full mt-4">
                <div className="flex justify-between gap-4 items-center">
                    <p className="text-xl font-bold text-gray-900 truncate">
                        {name}
                    </p>

                    <div className="flex items-center gap-1 w-fit bg-gray-100 shadow-sm rounded-full px-3 py-1">
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

                {/* Add to Cart Button or Toggle Switch */}
                <div className="w-full flex items-center justify-end mt-5">
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
                                className="rounded-md px-3 py-[5px] text-white bg-[#4977ec] hover:bg-[#3b62c2] shadow-md"
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

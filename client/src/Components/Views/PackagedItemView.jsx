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
            className={`${!isAvailable ? 'brightness-95 opacity-50' : 'hover:shadow-md'} shadow-sm relative bg-white transition-all rounded-lg overflow-hidden cursor-pointer`}
        >
            {/* Content */}
            <div className="flex flex-col justify-between gap-4.5 h-full w-full py-2.5 px-3.5">
                <div className="flex justify-between sm:text-lg items-center">
                    <p className="font-medium text-gray-900 w-[70%]">{name}</p>
                    <p>Rs. {price}</p>
                </div>

                {/* Add to Cart Button or Toggle Switch */}
                {user.role === 'student' && isAvailable && (
                    <div className="w-full">
                        {quantityInCart > 0 ? (
                            <div className="flex mx-auto items-center border w-fit border-gray-300 rounded-lg overflow-hidden">
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
                                    <div className="py-1">
                                        <div className="size-3.5 fill-white">
                                            {icons.plus}
                                        </div>
                                    </div>
                                }
                                onClick={addToCart}
                                className="rounded-full mx-auto size-8 flex items-center justify-center text-white bg-[#4977ec] hover:bg-[#3b62c2] shadow-md"
                            />
                        )}
                    </div>
                )}

                {user.role === 'contractor' && (
                    <div className="flex items-center justify-between w-full">
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

                        <div className="flex gap-2.5">
                            <Button
                                btnText={
                                    <div className="size-4 group-hover:stroke-[#4977ec] stroke-black fill-none">
                                        {icons.editUnfilled}
                                    </div>
                                }
                                className="bg-[#f0efef] p-2 group rounded-full shadow-sm hover:bg-[#ebeaea]"
                                onClick={editItem}
                            />
                            <div>
                                <Button
                                    btnText={
                                        <div className="size-4 group-hover:fill-red-700">
                                            {icons.delete}
                                        </div>
                                    }
                                    className="bg-[#f0efef] p-2 group rounded-full shadow-sm hover:bg-[#ebeaea]"
                                    onClick={removeItem}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

import { useState } from 'react';
import { PER_ITEM_PACKAGING_CHARGES } from '../../Constants/constants';
import { Button } from '..';
import { icons } from '../../Assets/icons';
import { usePopupContext, useStudentContext } from '../../Contexts';

export default function EditCartItem() {
    const { popupInfo, setShowPopup } = usePopupContext();
    const item = popupInfo.item;
    const { cartItems, setCartItems } = useStudentContext();
    const [input, setInput] = useState(item.specialInstructions || '');
    const [pack, setPack] = useState(item.isPacked || false);

    return (
        <div className="overflow-hidden relative w-[350px] sm:w-[450px] transition-all duration-300 bg-white rounded-xl text-black p-5 flex flex-col items-center justify-center gap-3">
            <Button
                btnText={
                    <div className="size-[20px] stroke-black">
                        {icons.cross}
                    </div>
                }
                title="Close"
                onClick={() => setShowPopup(false)}
                className="absolute top-2 right-2"
            />
            <h3 className="text-lg font-medium mb-2">Edit Item Details</h3>

            {item.type === 'Snack' && (
                <div className="w-full">
                    <label className="block text-sm font-medium text-gray-800 mb-1">
                        Special Instructions
                    </label>
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="w-full border-[0.01rem] border-gray-300 rounded-md text-sm p-2"
                        rows={3}
                        placeholder="E.g. No onions, extra spicy, etc."
                    />
                </div>
            )}

            <div className="flex items-center mb-3 w-full">
                <input
                    type="checkbox"
                    id="packItem"
                    checked={pack}
                    onChange={(e) => setPack(e.target.checked)}
                    className="size-[15px] text-[#4977ec] focus:ring-[#4977ec] border-gray-300 rounded"
                />
                <label
                    htmlFor="packItem"
                    className="ml-2 text-sm text-gray-700"
                >
                    Pack this item ( ₹ {PER_ITEM_PACKAGING_CHARGES} packaging
                    charges )
                </label>
            </div>

            <div className="flex items-center gap-4 w-full">
                <Button
                    className="bg-gray-200 text-gray-800 w-full px-4 py-2 rounded-md"
                    btnText="Cancel"
                    onClick={() => setShowPopup(false)}
                />
                <Button
                    className="bg-[#4977ec] text-white w-full px-4 py-2 rounded-md"
                    btnText="Save Changes"
                    onClick={() => {
                        const updatedCartItems = cartItems.map((i) => {
                            if (i._id === item._id) {
                                if (
                                    i.type === 'Snack' ||
                                    i.price === item.price
                                ) {
                                    return {
                                        ...i,
                                        specialInstructions: input,
                                        isPacked: pack,
                                    };
                                }
                            } else return i;
                        });
                        setCartItems(updatedCartItems);
                        localStorage.setItem(
                            'cartItems',
                            JSON.stringify(updatedCartItems)
                        );
                        setShowPopup(false);
                    }}
                />
            </div>
        </div>
    );
}

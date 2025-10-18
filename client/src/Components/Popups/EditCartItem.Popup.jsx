import { useState } from 'react';
import { Button } from '..';
import { icons } from '../../Assets/icons';
import { usePopupContext, useStudentContext } from '../../Contexts';

export default function EditCartItem() {
    const { popupInfo, setShowPopup } = usePopupContext();
    const item = popupInfo.item;
    const { cartItems, setCartItems } = useStudentContext();
    const [input, setInput] = useState(item.specialInstructions || '');

    function handleEdit() {
        const updatedCartItems = cartItems.map((i) => {
            if (i._id === item._id) {
                return { ...i, specialInstructions: input };
            } else return i;
        });
        setCartItems(updatedCartItems);
        localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
        setShowPopup(false);
    }

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
            <h3 className="text-xl font-semibold mb-2">Edit Item Details</h3>

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
                        placeholder="E.g. Pack 1 pc, No onions etc."
                    />
                </div>
            )}

            <div className="flex items-center gap-4 w-full">
                <Button
                    className="bg-gray-200 text-gray-800 w-full py-1.5 rounded-md"
                    btnText="Cancel"
                    onClick={() => setShowPopup(false)}
                />
                <Button
                    className="bg-[#4977ec] text-white w-full py-1.5 rounded-md"
                    btnText="Save"
                    onClick={handleEdit}
                />
            </div>
        </div>
    );
}

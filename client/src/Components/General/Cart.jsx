import { useStudentContext } from '../../Contexts';
import { icons } from '../../Assets/icons';
import { useNavigate } from 'react-router-dom';
import { Button } from '..';

export default function Cart() {
    const { cartItems } = useStudentContext();
    const navigate = useNavigate();

    // total quantity by adding all item quantities
    const totalQuantity = cartItems.reduce(
        (total, item) => total + item.quantity,
        0
    );

    return (
        <div className="relative">
            <Button
                btnText={
                    <div className="size-4 group-hover:fill-[#4977ec] fill-[#434343]">
                        {icons.cart}
                    </div>
                }
                title="View Cart"
                onClick={() => navigate('/cart')}
                className="bg-[#ffffff] p-2 group rounded-full border-1 border-gray-200 w-fit"
            />
            {/* total quantity count */}
            {totalQuantity > 0 && (
                <span className="text-xs flex items-center justify-center leading-3 text-white absolute -top-1 -right-1 size-4 bg-red-600 rounded-full">
                    {totalQuantity}
                </span>
            )}
        </div>
    );
}

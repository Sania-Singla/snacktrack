import { useNavigate, useSearchParams } from 'react-router-dom';
import { Snacks, PackagedItems, Button } from '../Components';
import { icons } from '../Assets/icons';
import { useEffect, useState } from 'react';
import { usePopupContext, useSnackContext, useUserContext } from '../Contexts';
import { snackService } from '../Services';
import { checkTokenExpired } from '../Utils';

export default function HomePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const filter = searchParams.get('filter') || 'snacks';
    const { setSnacks, setItems } = useSnackContext();
    const navigate = useNavigate();
    const { user, setUser } = useUserContext();
    const [loading, setLoading] = useState(true);
    const { setShowPopup, setPopupInfo } = usePopupContext();

    useEffect(() => {
        setLoading(true);

        const controller = new AbortController();
        const signal = controller.signal;

        (async function () {
            try {
                let items = [],
                    cartItems = [];
                    
                if (filter === 'snacks') {
                    [items, cartItems] = await Promise.all([
                        snackService.getSnacks(signal),
                        JSON.parse(localStorage.getItem('cartItems')) || [],
                    ]);
                } else {
                    [items, cartItems] = await Promise.all([
                        snackService.getPackagedFoodItems(signal),
                        JSON.parse(localStorage.getItem('cartItems')) || [],
                    ]);
                }

                if (items && !items.message) {
                    if (filter === 'snacks') {
                        setSnacks(
                            items.map((snack) => ({
                                ...snack,
                                quantity:
                                    cartItems.find((i) => i._id === snack._id)
                                        ?.quantity || 0,
                            }))
                        );
                    } else {
                        setItems(
                            items.map((item) => ({
                                ...item,
                                quantity:
                                    cartItems.find((i) => i._id === item._id)
                                        ?.quantity || 0,
                            }))
                        );
                    }
                } else checkTokenExpired(items, setUser);

                setLoading(false);
            } catch (err) {
                navigate('/server-error');
            }
        })();

        return () => controller.abort();
    }, [filter]);

    function addItem() {
        setShowPopup(true);
        setPopupInfo({ type: 'addItem' });
    }

    function addSnack() {
        setShowPopup(true);
        setPopupInfo({ type: 'addSnack' });
    }

    const handleOptionClick = (value) => {
        const params = new URLSearchParams(searchParams);
        params.set('filter', value);
        setSearchParams(params);
    };

    return (
        <>
            <div className="mb-8 w-full flex justify-between">
                {user.role === 'contractor' &&
                    (filter === 'snacks' ? (
                        <Button
                            onClick={addSnack}
                            btnText={
                                <div className="flex items-center justify-center gap-2">
                                    <div className="size-[16px] fill-white">
                                        {icons.plus}
                                    </div>
                                    <span className="text-[18px]">
                                        Add Snack
                                    </span>
                                </div>
                            }
                            title="Add Snack"
                            className="text-white rounded-md w-fit px-3 bg-[#4977ec] hover:bg-[#3b62c2]"
                        />
                    ) : (
                        <Button
                            onClick={addItem}
                            btnText={
                                <div className="flex items-center justify-center gap-2">
                                    <div className="size-[16px] fill-white">
                                        {icons.plus}
                                    </div>
                                    <span className="text-[18px]">
                                        Add Item
                                    </span>
                                </div>
                            }
                            title="Add Snack"
                            className="text-white rounded-md w-fit px-3 bg-[#4977ec] hover:bg-[#3b62c2]"
                        />
                    ))}
                <div className="flex items-center gap-4">
                    <Button
                        onClick={() => handleOptionClick('snacks')}
                        className="hover:bg-[#4977ec] hover:text-white group transition-all duration-100 bg-white shadow-sm rounded-md px-2 py-[5px]"
                        btnText={
                            <div className="flex items-center justify-center gap-2">
                                <div className="size-4 fill-gray-700 group-hover:fill-white">
                                    {icons.snack}
                                </div>
                                <span>Snacks</span>
                            </div>
                        }
                    />
                    <Button
                        onClick={() => handleOptionClick('packaged')}
                        className="hover:bg-[#4977ec] hover:text-white group transition-all duration-100 bg-white shadow-sm rounded-md px-2 py-[5px]"
                        btnText={
                            <div className="flex items-center justify-center gap-2">
                                <div className="size-[18px] stroke-gray-600 group-hover:stroke-white">
                                    {icons.soda}
                                </div>
                                <span>Packaged</span>
                            </div>
                        }
                    />
                </div>
            </div>

            {/* Render Based on Filter */}
            <div className="pb-8">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="size-[25px] fill-[#4977ec] dark:text-[#a2bdff]">
                            {icons.loading}
                        </div>
                    </div>
                ) : filter === 'snacks' ? (
                    <Snacks />
                ) : (
                    <PackagedItems />
                )}
            </div>
        </>
    );
}

import { useNavigate, useSearchParams } from 'react-router-dom';
import { Snacks, PackagedItems, Filter, Button } from '../Components';
import { icons } from '../Assets/icons';
import { useEffect, useState } from 'react';
import { usePopupContext, useSnackContext, useUserContext } from '../Contexts';
import { snackService } from '../Services';
import { checkTokenExpired } from '../Utils';

export default function HomePage() {
    const [searchParams] = useSearchParams();
    const filter = searchParams.get('filter') || 'snacks'; // Default to 'snacks'
    const { setSnacks, setItems } = useSnackContext();
    const navigate = useNavigate();
    const { user, setUser } = useUserContext();
    const [loading, setLoading] = useState(true);
    const { setShowPopup, setPopupInfo } = usePopupContext();

    const options = [
        { value: 'snacks', label: 'Snacks', icon: icons.snack },
        { value: 'packaged', label: 'Packaged', icon: icons.soda },
    ];

    useEffect(() => {
        setLoading(true);

        const controller = new AbortController();
        const signal = controller.signal;

        (async function () {
            try {
                const [snacks, items, cartItems] = await Promise.all([
                    snackService.getSnacks(signal),
                    snackService.getPackagedFoodItems(signal),
                    JSON.parse(localStorage.getItem('cartItems')) || [],
                ]);

                if (snacks && !snacks.message) {
                    setSnacks(
                        snacks.map((snack) => ({
                            ...snack,
                            quantity:
                                cartItems.find((i) => i._id === snack._id)
                                    ?.quantity || 0,
                        }))
                    );
                } else checkTokenExpired(snacks, setUser);

                if (items && !items.message) {
                    setItems(
                        items.map((item) => ({
                            ...item,
                            quantity:
                                cartItems.find((i) => i._id === item._id)
                                    ?.quantity || 0,
                        }))
                    );
                } else checkTokenExpired(PackagedItems, setUser);
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
                <Filter options={options} defaultOption={filter} />
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

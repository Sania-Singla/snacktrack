import { useNavigate, useSearchParams } from 'react-router-dom';
import { Snacks, PackagedItems, Filter } from '../Components';
import { icons } from '../Assets/icons';
import { useEffect, useState } from 'react';
import { useSnackContext, useUserContext } from '../Contexts';
import { snackService } from '../Services';
import { checkTokenExpired } from '../Utils';

export default function HomePage() {
    const [searchParams] = useSearchParams();
    const filter = searchParams.get('filter') || 'snacks'; // Default to 'snacks'
    const { setSnacks, setItems } = useSnackContext();
    const navigate = useNavigate();
    const { setUser } = useUserContext();
    const [loading, setLoading] = useState(true);

    const options = [
        { value: 'snacks', label: 'Snacks', icon: icons.snack },
        { value: 'packaged', label: 'Packaged', icon: icons.soda },
    ];

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        (async function () {
            try {
                setLoading(true);

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
            } catch (err) {
                navigate('/server-error');
            } finally {
                setLoading(false);
            }
        })();

        return () => controller.abort();
    }, []);

    return (
        <div>
            <div className="w-full flex justify-end mb-6">
                <Filter options={options} defaultOption={filter} />
            </div>

            {/* Render Based on Filter */}
            <div className="sm:px-4 pb-8">
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
        </div>
    );
}

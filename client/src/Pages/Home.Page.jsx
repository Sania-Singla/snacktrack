import { useNavigate, useSearchParams } from 'react-router-dom';
import { Snacks, PackagedItems, Filter } from '../Components';
import { icons } from '../Assets/icons';
import { useEffect, useState } from 'react';
import { useSnackContext } from '../Contexts';
import { snackService } from '../Services';

export default function HomePage() {
    const [searchParams] = useSearchParams();
    const filter = searchParams.get('filter') || 'snacks'; // Default to 'snacks'
    const { setSnacks, setItems } = useSnackContext();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    const options = [
        { value: 'snacks', label: 'Snacks', icon: icons.snack },
        { value: 'packaged', label: 'Packaged', icon: icons.soda },
    ];

    useEffect(() => {
        setLoading(true);

        const controller = new AbortController();
        const signal = controller.signal;

        (async function getSnacks() {
            try {
                const [snacks, items, cartItems] = await Promise.all([
                    snackService.getSnacks(signal),
                    snackService.getPackagedFoodItems(signal),
                    JSON.parse(localStorage.getItem('cartItems')) || [],
                ]);
                if (snacks && !snacks.message)
                    setSnacks(
                        snacks.map((snack) => ({
                            ...snack,
                            quantity:
                                cartItems.find((i) => i._id === snack._id)
                                    ?.quantity || 0,
                        }))
                    );
                if (items && !items.message)
                    setItems(
                        items.map((item) => ({
                            ...item,
                            variants: item.variants.map((v) => ({
                                ...v,
                                quantity:
                                    cartItems.find(
                                        ({ _id, price }) =>
                                            _id === item._id &&
                                            v.price === price
                                    )?.quantity || 0,
                            })),
                        }))
                    );
            } catch (err) {
                navigate('/server-error');
            } finally {
                setLoading(false);
            }
        })();

        return () => {
            controller.abort();
            setSnacks([]);
            setItems([]);
        };
    }, []);

    return (
        <div>
            <div className="w-full flex justify-end mb-6">
                <Filter options={options} defaultOption={filter} />
            </div>

            {/* Render Based on Filter */}
            <div className="sm:px-4 pb-8">
                {loading ? (
                    <div className="w-full text-center">loading...</div>
                ) : filter === 'snacks' ? (
                    <Snacks />
                ) : (
                    <PackagedItems />
                )}
            </div>
        </div>
    );
}

import { PackagedItemView } from '..';
import { icons } from '../../Assets/icons';
import { useEffect, useState } from 'react';
import {
    useSearchContext,
    useStudentContext,
    useUserContext,
} from '../../Contexts';
import { snackService } from '../../Services';
import { checkTokenExpired, paginate } from '../../Utils';
import toast from 'react-hot-toast';

export default function PackagedItems() {
    const { setUser } = useUserContext();
    const [items, setItems] = useState([]);
    const [itemsInfo, setItemsInfo] = useState({});
    const [loading, setLoading] = useState(true);
    const { cartItems, orderPlaced } = useStudentContext();
    const { debouncedSearch } = useSearchContext();
    const [page, setPage] = useState(1);

    function compute(data) {
        return data.map((s) => ({
            ...s,
            quantity: cartItems.find((i) => i._id === s._id)?.quantity || 0,
        }));
    }

    const paginateRef = paginate(itemsInfo.hasNextPage, loading, setPage);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        (async function () {
            try {
                setLoading(true);
                const res = await snackService.getItems({
                    page,
                    signal,
                    search: debouncedSearch,
                });

                setLoading(false);

                if (res && !res.message) {
                    setItemsInfo(res.itemsInfo);

                    if (page === 1) {
                        setItems(compute(res.items));
                    } else {
                        setItems((prev) => [...prev, ...compute(res.items)]);
                    }
                } else checkTokenExpired(res, setUser);
            } catch (err) {
                toast.error('Something went wrong. Please try again.');
            } finally {
            }
        })();

        return () => controller.abort();
    }, [page, debouncedSearch]);

    useEffect(() => {
        if (orderPlaced) {
            setItems((prevItems) => compute(prevItems));
        }
    }, [orderPlaced]);

    return (
        <>
            <div
                className={`grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`}
            >
                {items.map((item, i) => (
                    <PackagedItemView
                        key={item._id}
                        item={item}
                        reference={i + 1 === items.length ? paginateRef : null}
                    />
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="size-[25px] fill-[#4977ec] dark:text-[#a2bdff]">
                        {icons.loading}
                    </div>
                </div>
            ) : (
                items.length === 0 && (
                    <div className="italic text-gray-600">No items found</div>
                )
            )}
        </>
    );
}

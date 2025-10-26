import { PackagedItemView } from '..';
import { icons } from '../../Assets/icons';
import { useEffect, useState } from 'react';
import {
    useSearchContext,
    useSocketContext,
    useStudentContext,
    useUserContext,
} from '../../Contexts';
import { snackService } from '../../Services';
import { checkTokenExpired } from '../../Utils';
import toast from 'react-hot-toast';

export default function PackagedItems() {
    const { user, setUser } = useUserContext();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { cartItems, orderPlaced } = useStudentContext();
    const { debouncedSearch } = useSearchContext();
    const { socket } = useSocketContext();

    function compute(data) {
        return data.map((s) => ({
            ...s,
            quantity: cartItems.find((i) => i._id === s._id)?.quantity || 0,
        }));
    }

    useEffect(() => {
        const cached = JSON.parse(localStorage.getItem('items')) || [];

        if (!debouncedSearch) {
            setItems(compute(cached));
        }

        setItems(
            compute(
                cached.filter((i) =>
                    debouncedSearch
                        ? i.name
                              .toLowerCase()
                              .includes(debouncedSearch.toLowerCase())
                        : true
                )
            )
        );
    }, [debouncedSearch]);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        (async function () {
            try {
                setLoading(true);

                const cached = JSON.parse(localStorage.getItem('items'));
                const cachedVersion = localStorage.getItem('itemsVersion');

                const versionRes = await snackService.getItemsVersion({
                    canteenId: user.canteenId,
                    signal,
                });

                if (!versionRes || versionRes.message) {
                    checkTokenExpired(versionRes, setUser);
                    return;
                }

                const serverVersion = versionRes.version;

                const shouldFetch =
                    !cached ||
                    !cachedVersion ||
                    cachedVersion !== serverVersion;

                if (shouldFetch) {
                    const res = await snackService.getItems({
                        canteenId: user.canteenId,
                        signal,
                        page: 1,
                        limit: 1000,
                    });

                    if (res && !res.message) {
                        localStorage.setItem(
                            'items',
                            JSON.stringify(res.items)
                        );
                        localStorage.setItem('itemsVersion', serverVersion);
                        setItems(compute(res.items));
                    } else checkTokenExpired(res, setUser);
                } else {
                    setItems(compute(cached));
                }
            } catch (err) {
                toast.error('Something went wrong. Please try again.');
            } finally {
                setLoading(false);
            }
        })();

        return () => controller.abort();
    }, [user.canteenId]);

    useEffect(() => {
        if (orderPlaced) {
            setItems((prevItems) => compute(prevItems));
        }
    }, [orderPlaced]);

    useEffect(() => {
        if (!socket) return;

        socket.on('itemUpdated', (item) => {
            if (item.canteenId !== user.canteenId) return;

            const data = JSON.parse(localStorage.getItem('items')) || [];
            const newData = data.map((i) =>
                i._id === item._id ? { ...i, ...item } : i
            );
            localStorage.setItem('items', JSON.stringify(newData));
            setItems(newData);
        });

        socket.on('itemAdded', (item) => {
            if (item.canteenId !== user.canteenId) return;

            const data = JSON.parse(localStorage.getItem('items')) || [];
            const newData = [item, ...data];
            localStorage.setItem('items', JSON.stringify(newData));
            setItems(newData);
        });

        socket.on('itemDeleted', ({ itemId, canteenId }) => {
            if (canteenId !== user.canteenId) return;

            const data = JSON.parse(localStorage.getItem('items')) || [];
            const newData = data.filter((i) => i._id !== itemId);
            localStorage.setItem('items', JSON.stringify(newData));
            setItems(newData);
        });
    }, [socket]);

    if (loading) return null;

    return items.length === 0 ? (
        <div className="italic text-center text-gray-600">No items found</div>
    ) : (
        <div className={`grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`}>
            {items.map((item, i) => (
                <PackagedItemView key={item._id} item={item} />
            ))}
        </div>
    );
}

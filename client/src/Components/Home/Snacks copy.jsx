import { SnackView } from '..';
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

// paginated

export default function Snacks() {
    const [snacks, setSnacks] = useState([]);
    const [snacksInfo, setSnacksInfo] = useState({});
    const { user, setUser } = useUserContext();
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

    const paginateRef = paginate(snacksInfo.hasNextPage, loading, setPage);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        (async function () {
            try {
                setLoading(true);
                const res = await snackService.getSnacks({
                    canteenId: user.canteenId,
                    page,
                    signal,
                    search: debouncedSearch,
                });

                if (res && !res.message) {
                    setSnacksInfo(res.snacksInfo);

                    if (page === 1) {
                        setSnacks(compute(res.snacks));
                    } else {
                        setSnacks((prev) => [...prev, ...compute(res.snacks)]);
                    }
                } else checkTokenExpired(res, setUser);
            } catch (err) {
                toast.error('Something went wrong. Please try again.');
            } finally {
                setLoading(false);
            }
        })();

        return () => controller.abort();
    }, [page, debouncedSearch]);

    useEffect(() => {
        if (orderPlaced) {
            setSnacks((prevSnacks) => compute(prevSnacks));
        }
    }, [orderPlaced]);

    return (
        <>
            {snacks.length > 0 && (
                <div
                    className={`grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`}
                >
                    {snacks.map((s, i) => (
                        <SnackView
                            key={s._id}
                            snack={s}
                            reference={
                                i + 1 === snacks.length ? paginateRef : null
                            }
                        />
                    ))}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="size-[25px] fill-[#4977ec] dark:text-[#a2bdff]">
                        {icons.loading}
                    </div>
                </div>
            ) : (
                snacks.length === 0 && (
                    <p className="text-center italic text-gray-600">
                        No snacks found
                    </p>
                )
            )}
        </>
    );
}

import { SnackView } from '..';
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

export default function Snacks() {
    const [snacks, setSnacks] = useState([]);
    const { user, setUser } = useUserContext();
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
        const controller = new AbortController();
        const signal = controller.signal;

        (async function () {
            try {
                setLoading(true);

                const cached = JSON.parse(localStorage.getItem('snacks'));
                const cachedVersion = localStorage.getItem('snacksVersion');

                const versionRes = await snackService.getSnacksVersion({
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
                    const res = await snackService.getSnacks({
                        canteenId: user.canteenId,
                        signal,
                        page: 1,
                        limit: 1000,
                    });

                    if (res && !res.message) {
                        localStorage.setItem(
                            'snacks',
                            JSON.stringify(res.snacks)
                        );
                        localStorage.setItem('snacksVersion', serverVersion);
                        setSnacks(
                            compute(
                                res.snacks.filter((s) =>
                                    debouncedSearch
                                        ? s.name
                                              .toLowerCase()
                                              .includes(
                                                  debouncedSearch.toLowerCase()
                                              )
                                        : true
                                )
                            )
                        );
                    } else checkTokenExpired(res, setUser);
                } else {
                    setSnacks(
                        compute(
                            cached.filter((s) =>
                                debouncedSearch
                                    ? s.name
                                          .toLowerCase()
                                          .includes(
                                              debouncedSearch.toLowerCase()
                                          )
                                    : true
                            )
                        )
                    );
                }
            } catch (err) {
                toast.error('Something went wrong. Please try again.');
            } finally {
                setLoading(false);
            }
        })();

        return () => controller.abort();
    }, [debouncedSearch]);

    useEffect(() => {
        if (orderPlaced) {
            setSnacks((prevSnacks) => compute(prevSnacks));
        }
    }, [orderPlaced]);

    useEffect(() => {
        if (!socket) return;

        socket.on('snackUpdated', (snack) => {
            if (snack.canteenId !== user.canteenId) return;

            const data = JSON.parse(localStorage.getItem('snacks')) || [];
            const newData = data.map((s) =>
                s._id === snack._id ? { ...s, ...snack } : s
            );
            localStorage.setItem('snacks', JSON.stringify(newData));
            setSnacks(newData);
        });

        socket.on('snackAdded', (s) => {
            if (s.canteenId !== user.canteenId) return;

            const data = JSON.parse(localStorage.getItem('snacks')) || [];
            const newData = [s, ...data];
            localStorage.setItem('snacks', JSON.stringify(newData));
            setSnacks(newData);
        });

        socket.on('snackDeleted', ({ snackId, canteenId }) => {
            if (canteenId !== user.canteenId) return;

            const data = JSON.parse(localStorage.getItem('snacks')) || [];
            const newData = data.filter((s) => s._id !== snackId);
            localStorage.setItem('snacks', JSON.stringify(newData));
            setSnacks(newData);
        });
    }, [socket]);

    return (
        <>
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="size-[25px] fill-[#4977ec] dark:text-[#a2bdff]">
                        {icons.loading}
                    </div>
                </div>
            ) : snacks.length === 0 ? (
                <p className="text-center italic text-gray-400">
                    No snacks found
                </p>
            ) : (
                <div
                    className={`grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`}
                >
                    {snacks.map((s) => (
                        <SnackView key={s._id} snack={s} />
                    ))}
                </div>
            )}
        </>
    );
}

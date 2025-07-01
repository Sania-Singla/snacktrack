import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, PackagedItemView, SnackView } from '../Components';
import { icons } from '../Assets/icons';
import { useEffect, useState } from 'react';
import {
    usePopupContext,
    useSearchContext,
    useSnackContext,
    useStudentContext,
    useUserContext,
} from '../Contexts';
import { snackService } from '../Services';
import { checkTokenExpired, paginate } from '../Utils';
import { useCallback } from 'react';

export default function HomePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const filter = searchParams.get('filter') || 'snacks';
    const { setItems, items, itemsInfo, setItemsInfo } = useSnackContext();
    const navigate = useNavigate();
    const { user, setUser } = useUserContext();
    const [loading, setLoading] = useState(true);
    const { setShowPopup, setPopupInfo } = usePopupContext();
    const { cartItems, orderPlaced } = useStudentContext();
    const { search } = useSearchContext();
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const [page, setPage] = useState(1);

    // Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500); // 0.5s delay

        return () => clearTimeout(handler);
    }, [search]);

    function computeItems(data) {
        return data.map((s) => ({
            ...s,
            quantity: cartItems.find((i) => i._id === s._id)?.quantity || 0,
        }));
    }

    // pagination
    const paginateRef = paginate(itemsInfo?.hasNextPage, loading, setPage);

    const fetchItems = useCallback(
        async (signal, currentPage = 1) => {
            try {
                setLoading(true);
                const data = await snackService.getItems({
                    page: currentPage,
                    signal,
                    filter,
                    search: debouncedSearch,
                });

                if (data && !data.message) {
                    if (currentPage === 1) {
                        setItems(computeItems(data.items));
                    } else {
                        setItems((prev) => [
                            ...prev,
                            ...computeItems(data.items),
                        ]);
                    }
                    setItemsInfo(data.itemsInfo);
                } else {
                    checkTokenExpired(data, setUser);
                }
                setLoading(false);
            } catch (err) {
                navigate('/server-error');
            }
        },
        [filter, debouncedSearch, setItems, setItemsInfo, setUser, navigate]
    );

    useEffect(() => {
        setItems([]); // Clear current items immediately for new search and filter
        const controller = new AbortController();
        const signal = controller.signal;

        fetchItems(signal);

        return () => controller.abort();
    }, [filter, debouncedSearch, navigate]);

    useEffect(() => {
        if (page === 1) return; // Already handled in filter use effect

        const controller = new AbortController();
        const signal = controller.signal;

        fetchItems(signal, page);

        return () => controller.abort();
    }, [page, fetchItems]);

    useEffect(() => {
        setItems(computeItems(items));
    }, [orderPlaced]);

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

    const itemElements = items.map((item, i) =>
        filter === 'snacks' ? (
            <SnackView
                key={item._id}
                snack={item}
                reference={
                    i + 1 === items.length && itemsInfo?.hasNextPage
                        ? paginateRef
                        : null
                }
            />
        ) : (
            <PackagedItemView
                key={item._id}
                item={item}
                reference={
                    i + 1 === items.length && itemsInfo?.hasNextPage
                        ? paginateRef
                        : null
                }
            />
        )
    );

    return (
        <>
            <div className="mb-4 w-full flex justify-between">
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
                            className="text-white rounded-md px-2 text-nowrap bg-[#4977ec] hover:bg-[#3b62c2]"
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
                            className="text-white rounded-md px-2 text-nowrap bg-[#4977ec] hover:bg-[#3b62c2]"
                        />
                    ))}
                <div className="flex items-center gap-4 w-full place-content-end">
                    <Button
                        onClick={() => handleOptionClick('snacks')}
                        className="hover:bg-[#4977ec]  hover:text-white active:bg-[#4977ec] active:text-white group transition-all duration-100 bg-white shadow-sm rounded-md px-2 py-[5px]"
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
                        className="hover:bg-[#4977ec]  hover:text-white active:bg-[#4977ec]  active:text-white group transition-all duration-100 bg-white shadow-sm rounded-md px-2 py-[5px]"
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

            <div className="pb-8">
                {itemElements.length > 0 && (
                    <div
                        className={`grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[repeat(auto-fit,minmax(250px,1fr))]`}
                    >
                        {itemElements}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="size-[25px] fill-[#4977ec] dark:text-[#a2bdff]">
                            {icons.loading}
                        </div>
                    </div>
                ) : (
                    itemElements.length === 0 && (
                        <div className="italic text-gray-600">
                            No {filter === 'snacks' ? 'Snacks' : 'Items'} Found
                        </div>
                    )
                )}
            </div>
        </>
    );
}

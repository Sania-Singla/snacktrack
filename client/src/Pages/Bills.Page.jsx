import { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { billService } from '../Services';
import { BillCard, Button, Filter } from '../Components';
import { checkTokenExpired, paginate } from '../Utils';
import { icons } from '../Assets/icons';
import { usePopupContext, useSearchContext, useUserContext } from '../Contexts';

export default function BillsPage() {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [billsInfo, setBillsInfo] = useState({});
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const { search } = useSearchContext();
    const { setUser } = useUserContext();
    const { setShowPopup, setPopupInfo } = usePopupContext();
    const [searchParams] = useSearchParams();
    const filter = searchParams.get('filter') || new Date().getMonth();
    const navigate = useNavigate();

    const paginateRef = paginate(billsInfo?.hasNextPage, loading, setPage);

    // Debounce search input
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
        }, 500);
        return () => clearTimeout(handler);
    }, [search]);

    const fetchBills = useCallback(
        async (signal, currentPage = 1) => {
            try {
                setLoading(true);
                if (currentPage === 1) setBills([]);
                const res = await billService.getBills({
                    page: currentPage,
                    month: filter,
                    search: debouncedSearch,
                    signal,
                });

                if (res && !res.message) {
                    if (currentPage === 1) {
                        setBills(res.bills);
                    } else {
                        setBills((prev) => prev.concat(res.bills));
                    }
                    setBillsInfo(res.billsInfo);
                } else checkTokenExpired(res, setUser);

                setLoading(false);
            } catch (err) {
                navigate('/server-error');
            }
        },
        [filter, setUser, debouncedSearch, navigate]
    );

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;
        setPage(1); // Reset page on filter change
        fetchBills(signal, 1);
        return () => controller.abort();
    }, [filter, fetchBills]);

    useEffect(() => {
        if (page === 1) return;
        const controller = new AbortController();
        const signal = controller.signal;
        fetchBills(signal, page);
        return () => controller.abort();
    }, [page, fetchBills]);

    function generateIntermediateBill() {
        setShowPopup(true);
        setPopupInfo({ type: 'intermediateBill' });
    }

    const billElements = useMemo(() => {
        return bills.map((bill, i) => (
            <BillCard
                reference={
                    i + 1 === bills.length && billsInfo?.hasNextPage
                        ? paginateRef
                        : null
                }
                key={bill._id}
                bill={bill}
            />
        ));
    }, [bills, billsInfo, paginateRef]);

    const months = [
        { value: 1, label: 'January' },
        { value: 2, label: 'February' },
        { value: 3, label: 'March' },
        { value: 4, label: 'April' },
        { value: 5, label: 'May' },
        { value: 6, label: 'June' },
        { value: 7, label: 'July' },
        { value: 8, label: 'August' },
        { value: 9, label: 'September' },
        { value: 10, label: 'October' },
        { value: 11, label: 'November' },
        { value: 12, label: 'December' },
    ];

    return (
        <div className="w-full pt-2 sm:p-4">
            <div className="flex flex-col gap-6 sm:gap-4 sm:flex-row sm:items-center justify-between w-full mb-6">
                <div className="flex items-center justify-between gap-4 w-full">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Bills
                        </h1>
                        <div className="px-3 py-[3px] text-sm font-bold rounded-full border border-blue-200 bg-blue-50 text-blue-700">
                            {new Date().getFullYear()}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Filter options={months} defaultOption={filter} />
                        <Button
                            onClick={generateIntermediateBill}
                            className="hidden md:flex text-white rounded-lg py-2 w-fit font-medium text-nowrap px-4 items-center justify-center bg-[#4977ec] hover:bg-[#3b62c2]"
                            btnText="Generate Bill"
                        />
                        {bills.length > 0 && (
                            <div className="hidden md:flex text-lg font-semibold text-gray-700 border border-blue-500 bg-blue-50 rounded-lg px-3 py-[5px]">
                                Total: ₹{billsInfo.totalAmount.toFixed(2)}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="md:hidden flex items-center justify-center gap-4 mb-6">
                {bills.length > 0 && (
                    <div className="text-lg font-semibold text-gray-700 border border-blue-500 bg-blue-50 rounded-lg px-3 py-[5px]">
                        Total: ₹{billsInfo.totalAmount.toFixed(2)}
                    </div>
                )}

                <Button
                    onClick={generateIntermediateBill}
                    className="text-white rounded-lg py-2 w-fit font-medium text-nowrap px-4 flex items-center justify-center bg-[#4977ec] hover:bg-[#3b62c2]"
                    btnText="Generate Bill"
                />
            </div>

            {bills.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {billElements}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="size-[25px] fill-[#4977ec] dark:text-[#a2bdff]">
                        {icons.loading}
                    </div>
                </div>
            ) : (
                bills.length === 0 && (
                    <div className="italic text-gray-600">No bills found</div>
                )
            )}
        </div>
    );
}

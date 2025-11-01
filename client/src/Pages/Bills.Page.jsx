import { useEffect, useState } from 'react';
import { billService } from '../Services';
import { BillCard, Button, Dropdown } from '../Components';
import { checkTokenExpired, paginate } from '../Utils';
import { icons } from '../Assets/icons';
import {
    useOrderContext,
    usePopupContext,
    useSearchContext,
    useUserContext,
} from '../Contexts';
import toast from 'react-hot-toast';

export default function BillsPage() {
    const [bills, setBills] = useState([]);
    const [billsInfo, setBillsInfo] = useState({});
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const { debouncedSearch } = useSearchContext();
    const { setUser } = useUserContext();
    const { setShowPopup, setPopupInfo } = usePopupContext();
    const { monthFilter, setMonthFilter } = useOrderContext();

    const paginateRef = paginate(billsInfo?.hasNextPage, loading, setPage);

    useEffect(() => {
        setBills([]);
        setPage(1);
    }, [monthFilter, debouncedSearch]);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        (async function () {
            try {
                setLoading(true);
                const res = await billService.getBills({
                    page,
                    month: monthFilter,
                    search: debouncedSearch,
                    signal,
                });

                if (res && !res.message) {
                    setBillsInfo(res.billsInfo);

                    if (page === 1) {
                        setBills(res.bills);
                    } else {
                        setBills((prev) => prev.concat(res.bills));
                    }
                } else checkTokenExpired(res, setUser);
            } catch (err) {
                toast.error('Something went wrong. Please try again.');
            } finally {
                setLoading(false);
            }
        })();

        return () => controller.abort();
    }, [page, monthFilter, debouncedSearch]);

    function generateIntermediateBill() {
        setShowPopup(true);
        setPopupInfo({ type: 'intermediateBill' });
    }

    return (
        <>
            <div className="flex flex-col gap-6 sm:gap-4 sm:flex-row sm:items-center justify-between w-full mb-6">
                <div className="flex items-center justify-between gap-4 w-full">
                    <div className="flex items-center gap-3">
                        <h1 className="pl-2 text-xl font-semibold text-gray-900">
                            Bills
                        </h1>
                        <div className="px-2 py-0.5 text-xs font-semibold space-x-2 rounded-full border border-blue-200 bg-blue-50 text-blue-700">
                            <span>
                                {new Date(0, monthFilter - 1).toLocaleString(
                                    'default',
                                    { month: 'short' }
                                )}
                            </span>
                            <span>{new Date().getFullYear()}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={generateIntermediateBill}
                            className="hidden md:flex text-white rounded-md py-1.5 text-sm w-fit text-nowrap px-3 items-center justify-center bg-[#4977ec] hover:bg-[#3b62c2]"
                            btnText="Generate Bill"
                        />

                        <div>
                            <Dropdown
                                options={[
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
                                ]}
                                defaultVal={monthFilter}
                                setValue={setMonthFilter}
                                className="px-2 py-1"
                            />
                        </div>

                        {bills.length > 0 && (
                            <div className="hidden md:block font-medium text-[#4977ec] border-1 border-gray-300 bg-white rounded-md px-3 py-1">
                                Total: ₹{billsInfo.totalAmount.toFixed(2)}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="md:hidden flex items-center justify-center gap-4 mb-6">
                {bills.length > 0 && (
                    <div className="font-medium text-[#4977ec] border-1 border-gray-300 bg-white rounded-md px-3 py-1">
                        Total: ₹{billsInfo.totalAmount.toFixed(2)}
                    </div>
                )}

                <Button
                    onClick={generateIntermediateBill}
                    className="text-white rounded-md text-sm py-1.5 w-fit text-nowrap px-3 flex items-center justify-center bg-[#4977ec] hover:bg-[#3b62c2]"
                    btnText="Generate Bill"
                />
            </div>

            {bills.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bills.map((bill, i) => (
                        <BillCard
                            reference={
                                i + 1 === bills.length ? paginateRef : null
                            }
                            key={bill._id}
                            bill={bill}
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
                bills.length === 0 && (
                    <div className="italic text-gray-600 flex items-center justify-center">
                        No bills found
                    </div>
                )
            )}
        </>
    );
}

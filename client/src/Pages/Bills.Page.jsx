import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { billService } from '../Services';
import { BillCard, Filter } from '../Components';
import { checkTokenExpired, paginate } from '../Utils';
import { LIMIT } from '../Constants/constants';
import { icons } from '../Assets/icons';
import { useSearchContext, useUserContext } from '../Contexts';
import toast from 'react-hot-toast';

export default function BillsPage() {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [billsInfo, setBillsInfo] = useState({});
    const { search } = useSearchContext();
    const { setUser } = useUserContext();
    const [searchParams] = useSearchParams();
    // const [generatingBills, setGeneratingBills] = useState(false);
    const filter = searchParams.get('filter') || new Date().getMonth(); // Default to last month
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

    const paginateRef = paginate(billsInfo?.hasNextPage, loading, setPage);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        (async function () {
            try {
                setLoading(true);
                setBills([]);
                setPage(1);
                const res = await billService.getBills(
                    filter,
                    1,
                    LIMIT,
                    signal
                );
                if (res && !res.message) {
                    setBills((prev) => prev.concat(res.bills));
                    setBillsInfo(res.billsInfo);
                    setLoading(false);
                } else checkTokenExpired(res, setUser);
            } catch (err) {
                navigate('/server-error');
            }
        })();

        return () => controller.abort();
    }, [filter]);

    useEffect(() => {
        if (page === 1) return; // Already handled in filter use effect
        const controller = new AbortController();
        const signal = controller.signal;

        (async function () {
            try {
                setLoading(true);
                const res = await billService.getBills(
                    filter,
                    page,
                    LIMIT,
                    signal
                );
                if (res && !res.message) {
                    setBills((prev) => prev.concat(res.bills));
                    setBillsInfo(res.billsInfo);
                    setLoading(false);
                } else checkTokenExpired(res, setUser);
            } catch (err) {
                navigate('/server-error');
            }
        })();

        return () => controller.abort();
    }, [page]);

    // async function generateBills() {
    //     try {
    //         setGeneratingBills(true);
    //         const res = await billService.generateBills();
    //         if (res && res.success === true) {
    //             toast.success(res.message);
    //         } else checkTokenExpired(res, setUser);
    //     } catch (err) {
    //         navigate('/server-error');
    //     } finally {
    //         setGeneratingBills(false);
    //     }
    // }

    const billElements = useMemo(() => {
        return bills
            .filter(
                (b) =>
                    !search ||
                    b.studentInfo.fullName
                        .toLowerCase()
                        .includes(search.toLowerCase()) ||
                    b.studentInfo.userName
                        .toLowerCase()
                        .includes(search.toLowerCase())
            )
            .map((bill, i) => (
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
    }, [bills, search]);

    const totalAmount = useMemo(() => {
        return bills.reduce((total, bill) => total + (bill.amount || 0), 0);
    }, [bills]);

    return (
        <div>
            <div className="w-full pt-2 sm:p-4">
                <div className="flex items-center justify-between w-full mb-4 sm:mb-8">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Bills
                        </h1>
                        <div className="px-3 py-[3px] text-sm font-bold rounded-full border border-blue-200 bg-blue-50 text-blue-700">
                            {new Date().getFullYear()}
                        </div>
                    </div>
                    {/* <Button
                        onClick={generateBills}
                        className="text-white rounded-md py-2 px-4 mt-2 h-[40px] flex items-center justify-center text-lg transition-all duration-200 bg-[#4977ec] hover:bg-[#3b62c2] hover:shadow-md active:scale-[98%]"
                        btnText={
                            generatingBills ? (
                                <div className="size-5 fill-[#4977ec] dark:text-[#a2bdff]">
                                    {icons.loading}
                                </div>
                            ) : (
                                `Generate Bills`
                            )
                        }
                    /> */}
                    {bills.length > 0 && (
                        <div className="hidden sm:flex text-lg w-full items-center justify-center font-semibold text-gray-800 ">
                            <div className="border border-blue-500 bg-blue-50 rounded-lg px-3 py-[5px]">
                                Total: ₹{totalAmount.toFixed(2)}
                            </div>
                        </div>
                    )}
                    <Filter options={months} defaultOption={filter} />
                </div>

                {bills.length > 0 && (
                    <div className="sm:hidden text-xl w-full flex items-center justify-center pb-8 font-semibold text-gray-800 ">
                        <div className="border border-blue-500 bg-blue-50 rounded-lg px-3 py-2">
                            Total: ₹{totalAmount.toFixed(2)}
                        </div>
                    </div>
                )}

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
                        <div className="italic text-gray-600">
                            No bills found
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { billService } from '../Services';
import { BillCard } from '../Components';
import { checkTokenExpired, paginate } from '../Utils';
import { LIMIT } from '../Constants/constants';
import { icons } from '../Assets/icons';
import { useSearchContext, useUserContext } from '../Contexts';

export default function BillsPage() {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [billsInfo, setBillsInfo] = useState({});
    const { search } = useSearchContext();
    const { setUser } = useUserContext();

    const paginateRef = paginate(billsInfo?.hasNextPage, loading, setPage);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        (async function () {
            try {
                setLoading(true);
                const res = await billService.getBills(page, LIMIT, signal);
                if (res && !res.message) {
                    setBills((prev) => prev.concat(res.bills));
                    setBillsInfo(res.billsInfo);
                } else checkTokenExpired(res, setUser);
            } catch (err) {
                navigate('/server-error');
            } finally {
                setLoading(false);
            }
        })();

        return () => controller.abort();
    }, [page]);

    const billElements = bills
        .filter(
            (b) =>
                !search ||
                b.studentInfo.fullName
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                b.studentInfo.userName
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                b._id.slice(-8).toLowerCase().includes(search.toLowerCase())
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

    return (
        <div>
            <div className="w-full pt-2 sm:p-4">
                <div className="flex items-center gap-3 mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Bills</h1>
                    <div className="px-3 py-[3px] text-sm font-bold rounded-full border border-blue-200 bg-blue-50 text-blue-700">
                        {new Date().toLocaleDateString('default', {
                            month: 'long',
                        })}
                    </div>
                </div>

                {billElements.length > 0 && (
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
                    billElements.length === 0 && <div>No bills found</div>
                )}
            </div>
        </div>
    );
}

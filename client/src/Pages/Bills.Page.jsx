import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { billService } from '../Services';
import { BillCard } from '../Components';
import { paginate } from '../Utils';
import { LIMIT } from '../Constants/constants';

export default function BillsPage() {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const [billsInfo, setBillsInfo] = useState({});

    const paginateRef = paginate(billsInfo?.hasNextPage, loading, setPage);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        (async function getBills() {
            try {
                const res = await billService.getBills(page, LIMIT, signal);
                if (res && !res.message) {
                    setBills(res.bills);
                    setBillsInfo(res.billsInfo);
                }
            } catch (err) {
                navigate('/server-error');
            } finally {
                setLoading(false);
            }
        })();

        return () => controller.abort();
    }, [page]);

    return (
        <div>
            <div className="w-full p-4">
                <div className="flex items-center gap-4 mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Bills</h1>
                    <div className="px-3 py-[3px] text-sm font-bold rounded-full border border-blue-200 bg-blue-50 text-blue-700">
                        {new Date().toLocaleDateString('default', {
                            month: 'long',
                        })}
                    </div>
                </div>

                {loading ? (
                    <div>Loading...</div>
                ) : bills.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {bills.map((bill, i) => (
                            <BillCard
                                reference={
                                    i + 1 === bills.length &&
                                    billsInfo?.hasNextPage
                                        ? paginateRef
                                        : null
                                }
                                key={bill._id}
                                bill={bill}
                            />
                        ))}
                    </div>
                ) : (
                    <div>No bills found.</div>
                )}
            </div>
        </div>
    );
}

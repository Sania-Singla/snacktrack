import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { billService } from '../Services';
import { BillCard } from '../Components';

export default function BillsPage() {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        (async function getBills() {
            try {
                const res = await billService.getBills(signal);
                if (res && !res.message) setBills(res);
            } catch (err) {
                navigate('/server-error');
            } finally {
                setLoading(false);
            }
        })();

        return () => controller.abort();
    }, []);

    return (
        <div>
            <div className="w-full p-4">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Bills</h1>
                </div>

                {loading ? (
                    <div>Loading...</div>
                ) : bills.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {bills.map((bill) => (
                            <BillCard key={bill._id} bill={bill} />
                        ))}
                    </div>
                ) : (
                    <div>No bills found.</div>
                )}
            </div>
        </div>
    );
}

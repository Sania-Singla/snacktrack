import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { billService } from '../Services';
import { BillCard } from '../Components';
import { useSearchContext, useUserContext } from '../Contexts';
import { icons } from '../Assets/icons';

export default function StudentBillsPage() {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const { studentId } = useParams();
    const navigate = useNavigate();
    const { user } = useUserContext();
    const { search } = useSearchContext();

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        (async function getBills() {
            try {
                const res = await billService.getStudentBills(
                    studentId,
                    signal
                );
                if (res && !res.message) setBills(res);
            } catch (err) {
                navigate('/server-error');
            } finally {
                setLoading(false);
            }
        })();

        return () => controller.abort();
    }, []);

    const billElements = bills
        .filter(
            (b) =>
                !search ||
                b._id.slice(-8).toLowerCase().includes(search.toLowerCase())
        )
        .map((bill) => <BillCard key={bill._id} bill={bill} />);

    return (
        <div>
            <div className="w-full p-4">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {user._id === studentId ? 'My Bills' : 'Bills'}
                    </h1>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="size-[25px] fill-[#4977ec] dark:text-[#a2bdff]">
                            {icons.loading}
                        </div>
                    </div>
                ) : billElements.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {billElements}
                    </div>
                ) : (
                    <div>No bills found.</div>
                )}
            </div>
        </div>
    );
}

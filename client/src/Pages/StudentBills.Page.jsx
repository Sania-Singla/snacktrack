import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { billService } from '../Services';
import { StudentBillCard } from '../Components';
import { useUserContext } from '../Contexts';
import { icons } from '../Assets/icons';
import { checkTokenExpired } from '../Utils';

export default function StudentBillsPage() {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const { studentId } = useParams();
    const navigate = useNavigate();
    const { user, setUser } = useUserContext();

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        (async function () {
            try {
                setLoading(true);
                const res = await billService.getStudentBills(
                    studentId,
                    signal
                );
                if (res && !res.message) {
                    setBills(res);
                    setLoading(false);
                } else checkTokenExpired(res, setUser);
            } catch (err) {
                navigate('/server-error');
            }
        })();

        return () => controller.abort();
    }, []);

    const billElements = useMemo(() => {
        return bills.map((bill) => (
            <StudentBillCard studentInfo={user} key={bill._id} bill={bill} />
        ));
    }, [bills]);

    return (
        <div>
            <div className="w-full p-2 md:p-4">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        My Bills
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

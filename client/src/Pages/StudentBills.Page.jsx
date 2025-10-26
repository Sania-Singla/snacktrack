import { useEffect, useLayoutEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { billService } from '../Services';
import { StudentBillCard } from '../Components';
import { useUserContext } from '../Contexts';
import { icons } from '../Assets/icons';
import { checkTokenExpired } from '../Utils';
import toast from 'react-hot-toast';

export default function StudentBillsPage() {
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const { studentId } = useParams();
    const { user, setUser } = useUserContext();
    const navigate = useNavigate();

    useLayoutEffect(() => {
        if (studentId && user._id !== studentId) {
            navigate('/not-found');
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        (async function () {
            try {
                setLoading(true);
                const res = await billService.getStudentBills({
                    studentId,
                    signal,
                });
                if (res && !res.message) {
                    setBills(res);
                } else checkTokenExpired(res, setUser);
            } catch (err) {
                toast.error('Something went wrong. Please try again.');
            } finally {
                setLoading(false);
            }
        })();

        return () => controller.abort();
    }, [studentId]);

    return (
        <>
            <div className="flex items-center justify-between mb-8">
                <h1 className="pl-2 text-xl font-semibold text-gray-900">
                    My Bills
                </h1>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="size-[25px] fill-[#4977ec] dark:text-[#a2bdff]">
                        {icons.loading}
                    </div>
                </div>
            ) : bills.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bills.map((bill) => (
                        <StudentBillCard
                            studentInfo={user}
                            key={bill._id}
                            bill={bill}
                        />
                    ))}
                </div>
            ) : (
                <div className="italic text-gray-600 text-center">
                    No bills found.
                </div>
            )}
        </>
    );
}

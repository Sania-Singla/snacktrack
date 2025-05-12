import { useState, useEffect } from 'react';
import { orderService } from '../Services';
import { useNavigate } from 'react-router-dom';
import { icons } from '../Assets/icons';
import { useUserContext } from '../Contexts';
import { checkTokenExpired } from '../Utils';

export default function StatisticsPage() {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [expandedMonth, setExpandedMonth] = useState(null);
    const navigate = useNavigate();
    const { setUser } = useUserContext();

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        (async function () {
            try {
                const res = await orderService.getStatistics(signal);
                if (res && !res.message) setData(res);
                else checkTokenExpired(res, setUser);
            } catch (err) {
                navigate('/server-error');
            } finally {
                setLoading(false);
            }
        })();

        return () => controller.abort();
    }, []);

    return loading ? (
        <div className="flex justify-center py-12">
            <div className="size-[25px] fill-[#4977ec] dark:text-[#a2bdff]">
                {icons.loading}
            </div>
        </div>
    ) : (
        <div className="sm:p-4 w-full">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">
                Statistics for {new Date().getFullYear()}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.map((m, i) => (
                    <div
                        key={m.month}
                        className="bg-white h-fit rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                    >
                        <div
                            className="p-4 cursor-pointer flex justify-between items-center"
                            onClick={() =>
                                setExpandedMonth(expandedMonth === i ? null : i)
                            }
                        >
                            <div>
                                <h3 className="mb-1 text-lg font-semibold text-gray-800">
                                    {new Date(2000, m.month - 1).toLocaleString(
                                        'default',
                                        { month: 'long' }
                                    )}
                                </h3>
                                <p className="italic text-sm text-gray-600">
                                    Order Count: {m.orderCount}
                                </p>
                            </div>
                            <span className="text-lg font-bold text-[#4977ec] mr-3">
                                ₹{m.monthlyTotal.toLocaleString()}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

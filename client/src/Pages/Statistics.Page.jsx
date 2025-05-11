import { useState, useEffect } from 'react';
import { orderService } from '../Services';
import { useNavigate } from 'react-router-dom';
import { icons } from '../Assets/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserContext } from '../Contexts';
import { checkTokenExpired } from '../Utils';

const COLORS = ['#4977ec', '#4CAF50', '#FFC107', '#FF5722', '#9C27B0'];

export default function StatisticsPage() {
    const [data, setData] = useState({ monthlySales: [], yearlySummary: {} });
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

    const toggleMonthExpand = (i) => {
        setExpandedMonth(expandedMonth === i ? null : i);
    };

    const monthlyItemSales =
        data.monthlySales?.map((month) => ({
            ...month,
            monthName: new Date(2000, month.month - 1).toLocaleString(
                'default',
                { month: 'long' }
            ),
            items: month.items.sort((a, b) => b.totalRevenue - a.totalRevenue),
        })) || [];

    return loading ? (
        <div className="flex justify-center py-12">
            <div className="size-[25px] fill-[#4977ec] dark:text-[#a2bdff]">
                {icons.loading}
            </div>
        </div>
    ) : (
        <div className="sm:p-4 w-full">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">
                Sales Statistics for {data.year}
            </h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">
                        Total Revenue
                    </h3>
                    <p className="text-2xl font-bold text-[#4977ec]">
                        ₹
                        {(
                            data.yearlySummary?.totalRevenue || 0
                        ).toLocaleString()}
                    </p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">
                        Items Sold
                    </h3>
                    <p className="text-2xl font-bold text-[#4CAF50]">
                        {(
                            data.yearlySummary?.totalItemsSold || 0
                        ).toLocaleString()}
                    </p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-600 mb-1">
                        Avg Monthly Revenue
                    </h3>
                    <p className="text-2xl font-bold text-[#FF5722]">
                        ₹
                        {(
                            data.yearlySummary?.averageMonthlyRevenue || 0
                        ).toFixed(2)}
                    </p>
                </div>
            </div>

            {/* Monthly Sales Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {monthlyItemSales.map((month, i) => (
                    <div
                        key={month.month}
                        className="bg-white h-fit rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                    >
                        {/* Clickable Header */}
                        <div
                            className="p-4 cursor-pointer flex justify-between items-center"
                            onClick={() => toggleMonthExpand(i)}
                        >
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {month.monthName}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    {month.items.length} items sold
                                </p>
                            </div>
                            <div className="flex items-center">
                                <span className="text-xl font-bold text-[#4977ec] mr-3">
                                    ₹{month.monthlyTotal.toLocaleString()}
                                </span>
                                <div
                                    className={`transition-transform ${expandedMonth === i ? 'rotate-180' : ''}`}
                                >
                                    <div className="size-4 fill-gray-500">
                                        {icons.arrowDown}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Expandable Content */}
                        <AnimatePresence>
                            {expandedMonth === i && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-4 pb-4 border-t pt-4 border-gray-100">
                                        {/* Item List */}
                                        <div className="space-y-3">
                                            <h4 className="font-medium text-gray-700 mb-2">
                                                Top Selling Items:
                                            </h4>
                                            {month.items.map((item, index) => (
                                                <div
                                                    key={item.itemId}
                                                    className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                                                >
                                                    <div className="flex items-center">
                                                        <div
                                                            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold mr-3"
                                                            style={{
                                                                backgroundColor:
                                                                    COLORS[
                                                                        index %
                                                                            COLORS.length
                                                                    ],
                                                            }}
                                                        >
                                                            {index + 1}
                                                        </div>
                                                        <span className="font-medium">
                                                            {item.itemName}
                                                        </span>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm text-gray-600">
                                                            {item.totalQuantity}{' '}
                                                            sold
                                                        </p>
                                                        <p className="font-bold text-[#4977ec]">
                                                            ₹
                                                            {item.totalRevenue.toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>
        </div>
    );
}

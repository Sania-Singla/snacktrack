import { useEffect, useState } from 'react';
import { orderService } from '../Services';
import { useNavigate } from 'react-router-dom';
import { icons } from '../Assets/icons';
import {
    BarChart,
    Bar,
    XAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

const COLORS = [
    '#4977ec',
    '#4CAF50',
    '#FFC107',
    '#FF5722',
    '#9C27B0',
    '#009688',
];

export default function StatisticsPage() {
    const [data, setData] = useState({ monthlySales: [], yearlySummary: {} });
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        const signal = controller.signal;

        (async function getStats() {
            try {
                setLoading(true);
                const res = await orderService.getStatistics(signal);
                if (res && !res.message) {
                    setData(res);
                }
            } catch (err) {
                navigate('/server-error');
            } finally {
                setLoading(false);
            }
        })();

        return () => controller.abort();
    }, []);

    // data for charts
    const monthlyRevenueData =
        data.monthlySales?.map((month) => ({
            name: month?.monthName ? month.monthName.substring(0, 3) : 'N/A', // Safely get first 3 chars
            fullMonthName: month?.monthName || 'Unknown', // Keep full name for tooltips
            revenue: month.monthlyTotal,
        })) || [];

    const topItemsData = data.monthlySales?.flatMap(
        (month) =>
            month.items
                .map((item) => ({
                    ...item,
                    month: month.monthName,
                }))
                .sort((a, b) => b.totalRevenue - a.totalRevenue)
                .slice(0, 6) || []
    );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
            },
        },
    };

    return loading ? (
        <div className="flex justify-center py-12">
            <div className="size-[25px] fill-[#4977ec] animate-spin">
                {icons.loading}
            </div>
        </div>
    ) : (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="p-6 max-w-7xl mx-auto"
        >
            <h1 className="text-2xl font-bold mb-6 text-gray-800">
                Sales Statistics for {data.year}
            </h1>

            {/* Yearly Summary Cards */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
                variants={containerVariants}
            >
                <motion.div
                    variants={itemVariants}
                    className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
                >
                    <h3 className="text-sm font-medium text-gray-600 mb-1">
                        Total Revenue
                    </h3>
                    <p className="text-2xl font-bold text-[#4977ec]">
                        ₹
                        <CountUp
                            end={data.yearlySummary?.totalRevenue || 0}
                            duration={2}
                            separator=","
                        />
                    </p>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
                >
                    <h3 className="text-sm font-medium text-gray-600 mb-1">
                        Items Sold
                    </h3>
                    <p className="text-2xl font-bold text-[#4CAF50]">
                        <CountUp
                            end={data.yearlySummary?.totalItemsSold || 0}
                            duration={2}
                            separator=","
                        />
                    </p>
                </motion.div>

                <motion.div
                    variants={itemVariants}
                    className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
                >
                    <h3 className="text-sm font-medium text-gray-600 mb-1">
                        Avg Monthly Revenue
                    </h3>
                    <p className="text-2xl font-bold text-[#FF5722]">
                        ₹
                        <CountUp
                            end={data.yearlySummary?.averageMonthlyRevenue || 0}
                            duration={2}
                            decimals={2}
                        />
                    </p>
                </motion.div>
            </motion.div>

            {/* Tabs for different views */}
            <Tabs
                selectedIndex={activeTab}
                onSelect={(index) => setActiveTab(index)}
                className="mb-4"
            >
                <TabList className="flex border-b border-gray-200">
                    <Tab className="px-4 py-2 cursor-pointer focus:outline-none text-sm font-medium text-gray-600 hover:text-[#4977ec]">
                        Monthly Revenue
                    </Tab>
                    <Tab className="px-4 py-2 cursor-pointer focus:outline-none text-sm font-medium text-gray-600 hover:text-[#4977ec]">
                        Top Items
                    </Tab>
                    <Tab className="px-4 py-2 cursor-pointer focus:outline-none text-sm font-medium text-gray-600 hover:text-[#4977ec]">
                        Monthly Breakdown
                    </Tab>
                </TabList>

                <TabPanel>
                    <motion.div
                        variants={itemVariants}
                        className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mt-4"
                    >
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">
                            Monthly Revenue Trend
                        </h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyRevenueData}>
                                    <XAxis
                                        dataKey="name"
                                        tick={{ fill: '#6B7280' }}
                                        axisLine={{ stroke: '#E5E7EB' }}
                                    />
                                    <Tooltip
                                        formatter={(value) => [
                                            `₹${value.toLocaleString()}`,
                                            'Revenue',
                                        ]}
                                        labelFormatter={(value) => {
                                            const fullMonth =
                                                monthlyRevenueData.find(
                                                    (m) => m.name === value
                                                )?.fullMonthName;
                                            return fullMonth || value;
                                        }}
                                        contentStyle={{
                                            borderRadius: '8px',
                                            border: '1px solid #E5E7EB',
                                            boxShadow:
                                                '0 2px 4px rgba(0,0,0,0.1)',
                                            background: '#fff',
                                        }}
                                    />
                                    <Bar
                                        dataKey="revenue"
                                        fill="#4977ec"
                                        radius={[4, 4, 0, 0]}
                                        animationBegin={100}
                                        animationDuration={1500}
                                        name="Revenue"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </TabPanel>

                <TabPanel>
                    <motion.div
                        variants={itemVariants}
                        className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mt-4"
                    >
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">
                            Top Selling Items
                        </h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={topItemsData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="totalRevenue"
                                        nameKey="itemName"
                                        animationBegin={100}
                                        animationDuration={1500}
                                        label={({ name, percent }) =>
                                            `${name} ${(percent * 100).toFixed(0)}%`
                                        }
                                    >
                                        {topItemsData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={
                                                    COLORS[
                                                        index % COLORS.length
                                                    ]
                                                }
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) => [
                                            `₹${value.toLocaleString()}`,
                                            'Revenue',
                                        ]}
                                        contentStyle={{
                                            borderRadius: '8px',
                                            border: '1px solid #E5E7EB',
                                            boxShadow:
                                                '0 2px 4px rgba(0,0,0,0.1)',
                                            background: '#fff',
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </TabPanel>

                <TabPanel>
                    <motion.div
                        variants={itemVariants}
                        className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mt-4"
                    >
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">
                            Monthly Sales Breakdown
                        </h3>
                        <div className="space-y-4">
                            {data.monthlySales?.map((month) => (
                                <div
                                    key={month.month}
                                    className="border-b border-gray-100 pb-4 last:border-b-0"
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-medium text-gray-800">
                                            {month.monthName}
                                        </h4>
                                        <span className="font-bold text-gray-900">
                                            ₹
                                            {month.monthlyTotal.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        {month.items
                                            .sort(
                                                (a, b) =>
                                                    b.totalRevenue -
                                                    a.totalRevenue
                                            )
                                            .slice(0, 3)
                                            .map((item) => (
                                                <div
                                                    key={item.itemId}
                                                    className="flex justify-between text-sm"
                                                >
                                                    <span className="text-gray-600">
                                                        {item.itemName}
                                                    </span>
                                                    <span className="font-medium">
                                                        ₹
                                                        {item.totalRevenue.toLocaleString()}{' '}
                                                        ({item.totalQuantity}{' '}
                                                        sold)
                                                    </span>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </TabPanel>
            </Tabs>
        </motion.div>
    );
}

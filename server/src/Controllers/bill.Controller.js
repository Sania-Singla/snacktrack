import { OK } from '../Constants/index.js';
import { tryCatch } from '../Utils/index.js';
import { Bill, Order } from '../Models/index.js';
import { Types } from 'mongoose';
import cron from 'node-cron';

const getStudentBills = tryCatch('get student bills', async (req, res) => {
    const { studentId } = req.params;
    const bills = await Bill.aggregate([
        { $match: { studentId: new Types.ObjectId(studentId) } },
        {
            $lookup: {
                from: 'students',
                localField: 'studentId',
                foreignField: '_id',
                as: 'studentInfo',
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            userName: 1,
                            email: 1,
                            phoneNumber: 1,
                            avatar: 1,
                        },
                    },
                ],
            },
        },
        { $unwind: '$studentInfo' },
        { $sort: { createdAt: -1 } },
    ]);

    if (bills.length) {
        return res.status(OK).json(bills);
    } else {
        return res.status(OK).json({ message: 'no bills found' });
    }
});

const getBills = tryCatch('get bills', async (req, res) => {
    const contractor = req.user;
    const { page = 1, limit = 10 } = req.query;

    // get bills of the previous month only
    const bills = await Bill.aggregatePaginate(
        [
            {
                $match: {
                    canteenId: new Types.ObjectId(contractor.canteenId),
                    month: new Date().getMonth(), // previous month as 0 indexed
                    year: new Date().getFullYear(),
                },
            },
            {
                $lookup: {
                    from: 'students',
                    localField: 'studentId',
                    foreignField: '_id',
                    as: 'studentInfo',
                    pipeline: [
                        {
                            $project: {
                                fullName: 1,
                                userName: 1,
                                email: 1,
                                phoneNumber: 1,
                                avatar: 1,
                            },
                        },
                    ],
                },
            },
            { $unwind: '$studentInfo' },
        ],
        {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 },
        }
    );

    if (bills.docs.length) {
        return res.status(OK).json({
            bills: bills.docs,
            billsInfo: {
                totalPages: bills.totalPages,
                hasNextPage: bills.hasNextPage,
                hasPrevPage: bills.hasPrevPage,
            },
        });
    } else {
        return res.status(OK).json({ message: 'no bills found' });
    }
});

const markPaid = tryCatch('mark bill paid', async (req, res) => {
    const { billId } = req.params;
    const contractor = req.user;

    const bill = await Bill.findOneAndUpdate(
        {
            _id: new Types.ObjectId(billId),
            canteenId: new Types.ObjectId(contractor.canteenId),
        },
        { paid: true, paidOn: new Date() },
        { new: true }
    );
    if (!bill) {
        return res.status(404).json({ message: 'bill not found' });
    }
    return res.status(OK).json({ message: 'bill marked as paid' });
});

// Automatic using cron job
const generateBill = tryCatch('generate bill', async (req, res) => {
    // Get the previous month and year
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const month = lastMonth.getMonth(); // Months are 0-indexed in JS
    const year = lastMonth.getFullYear();

    // Find all students who have orders in the previous month
    const studentsWithOrders = await Order.aggregate([
        {
            $match: {
                status: 'PickedUp',
                createdAt: {
                    $gte: new Date(year, month - 1, 1),
                    $lt: new Date(year, month, 1),
                },
            },
        },
        {
            $group: {
                _id: '$studentId',
                totalAmount: { $sum: '$amount' },
                canteenId: { $first: '$canteenId' },
            },
        },
    ]);

    // Generate bills for each student
    const billPromises = studentsWithOrders.map(async (student) => {
        const existingBill = await Bill.findOne({
            studentId: student._id,
            month,
            year,
        });

        if (!existingBill) {
            return Bill.create({
                studentId: student._id,
                canteenId: student.canteenId,
                month,
                year,
                amount: student.totalAmount,
            });
        }
        return null;
    });

    await Promise.all(billPromises);
    console.log(`👍 Automated billing completed for ${month}/${year}`);
});

const cleanupOldBillsAndOrders = tryCatch(
    'cleanup old bills and orders',
    async () => {
        // Get current date
        const now = new Date();
        const currentYear = now.getFullYear();

        // Determine if it's January 1st or July 1st
        const isJan1 = now.getMonth() === 0 && now.getDate() === 1;
        const isJuly1 = now.getMonth() === 6 && now.getDate() === 1;

        if (!isJan1 && !isJuly1) {
            console.log('Not January 1st or July 1st - skipping cleanup');
            return;
        }

        // For January 1st, delete all bills/orders from previous year's first half (Jan-Jun)
        // For July 1st, delete all bills/orders from previous year's second half (Jul-Dec)
        const startMonth = isJan1 ? 0 : 6; // January or July
        const endMonth = isJan1 ? 5 : 11; // June or December
        const targetYear = isJan1 ? currentYear - 1 : currentYear;

        const startDate = new Date(targetYear, startMonth, 1);
        const endDate = new Date(targetYear, endMonth + 1, 1); // +1 to include last day of month

        console.log(
            `🧹 Starting cleanup for ${isJan1 ? 'Jan-Jun' : 'Jul-Dec'} ${targetYear}`
        );

        // Delete all paid bills in the target period
        const billDeleteResult = await Bill.deleteMany({
            paid: true,
            paidOn: { $gte: startDate, $lt: endDate },
        });

        // Delete all orders in the target period
        const orderDeleteResult = await Order.deleteMany({
            createdAt: { $gte: startDate, $lt: endDate },
        });

        console.log(
            `🧹 Cleanup completed for ${isJan1 ? 'first half' : 'second half'} of ${targetYear}: ` +
                `Deleted ${billDeleteResult.deletedCount} paid bills and ` +
                `${orderDeleteResult.deletedCount} orders`
        );
    }
);

// Scheduled cron job to run on the 1st of every month at 12:05 AM
const startBillingCronJob = () => {
    // Run at 00:05 on the 1st of every month
    cron.schedule('5 0 1 * *', generateBill, {
        scheduled: true,
        timezone: 'Asia/Kolkata',
    });

    console.log(
        '✨ Billing cron job scheduled to run on the 1st at 12:05 AM of every month'
    );
};

const startCleanupCronJob = () => {
    // Run at 12:05 AM on January 1st and July 1st each year
    cron.schedule('5 0 1 1,7 *', cleanupOldBillsAndOrders, {
        scheduled: true,
        timezone: 'Asia/Kolkata',
    });

    console.log(
        '🧹 Cleanup cron job scheduled to run at 12:05 AM on Jan 1st and July 1st each year'
    );
};

export {
    markPaid,
    generateBill,
    getBills,
    getStudentBills,
    startBillingCronJob,
    startCleanupCronJob,
    cleanupOldBillsAndOrders,
};

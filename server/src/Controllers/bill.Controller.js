import { OK } from '../Constants/index.js';
import { tryCatch } from '../Utils/index.js';
import { Bill, Order, Student } from '../Models/index.js';
import { Types } from 'mongoose';
import cron from 'node-cron';

const getStudentBills = tryCatch('get student bills', async (req, res) => {
    const { studentId } = req.params;
    const bills = await Bill.find({ studentId: new Types.ObjectId(studentId) });

    if (bills.length) {
        return res.status(OK).json(bills);
    } else {
        return res.status(OK).json({ message: 'no bills found' });
    }
});

const getBills = tryCatch('get bills', async (req, res) => {
    const contractor = req.user;
    const { page = 1, limit = 10 } = req.query;

    const students = await Student.aggregatePaginate(
        [
            { $match: { canteenId: new Types.ObjectId(contractor.canteenId) } },
            {
                $lookup: {
                    from: 'bills',
                    localField: '_id',
                    foreignField: 'studentId',
                    as: 'bills',
                    pipeline: [
                        {
                            $project: {
                                paid: 1,
                                paidOn: 1,
                                month: 1,
                                year: 1,
                                amount: 1,
                                studentId: 1,
                            },
                        },
                        { $sort: { month: -1, year: -1 } },
                    ],
                },
            },
            {
                $project: {
                    userName: 1,
                    fullName: 1,
                    bills: 1,
                    avatar: 1,
                    email: 1,
                    phoneNumber: 1,
                },
            },
        ],
        {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { userName: 1 },
        }
    );

    if (students.docs.length) {
        return res.status(OK).json({
            students: students.docs,
            studentsInfo: {
                totalPages: students.totalPages,
                hasNextPage: students.hasNextPage,
                hasPrevPage: students.hasPrevPage,
            },
        });
    } else {
        return res.status(OK).json({ message: 'no students found' });
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

// generate bills for the previous month
const generateBills = tryCatch('generate bills', async (req, res) => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const month = lastMonth.getMonth();
    const year = lastMonth.getFullYear();

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

    const operations = studentsWithOrders.map((student) => ({
        updateOne: {
            filter: {
                studentId: student._id,
                month,
                year,
            },
            update: {
                $setOnInsert: {
                    studentId: student._id,
                    canteenId: student.canteenId,
                    month,
                    year,
                    amount: student.totalAmount,
                },
            },
            upsert: true,
        },
    }));

    if (operations.length > 0) {
        await Bill.bulkWrite(operations);
        console.log(`👍 Automated billing completed for ${month + 1}/${year}`);
    } else {
        console.log('ℹ️ No students with picked up orders for billing period.');
    }

    if (res) res.status(OK).json({ message: 'bills generated' });
});

const cleanupOldBillsAndOrders = tryCatch(
    'cleanup old bills and orders',
    async () => {
        const now = new Date();
        const isJan1 = now.getMonth() === 0 && now.getDate() === 1;

        if (!isJan1) {
            console.log('🧹 Not January 1st - skipping cleanup');
            return;
        }

        console.log(
            '🧹 Starting full paid bill and order cleanup (January 1st)'
        );

        const paidBills = await Bill.find({ paid: true });
        const paidBillIds = paidBills.map((b) => b._id);

        await Promise.all([
            Bill.deleteMany({ _id: { $in: paidBillIds } }),
            Order.deleteMany({ billId: { $in: paidBillIds } }),
        ]);

        console.log(`🧹 Cleanup completed for ${targetYear}`);
    }
);

const startBillingCronJob = () => {
    // Run at 12:05 on the 1st of every month
    cron.schedule('5 0 1 * *', generateBills, {
        scheduled: true,
        timezone: 'Asia/Kolkata',
    });

    console.log(
        '✨ Billing cron job scheduled to run on the 1st at 12:05 AM of every month'
    );
};

const startCleanupCronJob = () => {
    // Run at 12:05 AM on January 1st
    cron.schedule('5 0 1 1 *', cleanupOldBillsAndOrders, {
        scheduled: true,
        timezone: 'Asia/Kolkata',
    });

    console.log(
        '🧹 Cleanup cron job scheduled to run at 12:05 AM on Jan 1st each year'
    );
};

export {
    markPaid,
    generateBills,
    getBills,
    getStudentBills,
    startBillingCronJob,
    startCleanupCronJob,
    cleanupOldBillsAndOrders,
};

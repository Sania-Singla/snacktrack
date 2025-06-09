import { OK } from '../Constants/index.js';
import { tryCatch } from '../Utils/index.js';
import { Bill, Order } from '../Models/index.js';
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
    const { page = 1, limit = 10, month = new Date().getMonth() } = req.query;

    const bills = await Bill.aggregatePaginate(
        [
            {
                $match: {
                    canteenId: new Types.ObjectId(contractor.canteenId),
                    month: parseInt(month),
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

// todo: PENDING

const generateBill = tryCatch('generate bill for student', async (req, res) => {
    const { studentId } = req.params;
    const contractor = req.user;
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

    if (res) res.status(OK).json({ message: 'operation performed' });
});

const cleanOldBillsAndOrders = tryCatch(
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
    cron.schedule('5 0 1 1 *', cleanOldBillsAndOrders, {
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
    cleanOldBillsAndOrders,
};

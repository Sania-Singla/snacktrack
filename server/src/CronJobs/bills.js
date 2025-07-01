import { tryCatch } from '../Utils/index.js';
import { Bill, Order } from '../Models/index.js';
import cron from 'node-cron';
import moment from 'moment';

const generateBills = tryCatch('generate bills', async () => {
    const lastMonth = moment().subtract(1, 'month').tz('Asia/Kolkata');
    const month = lastMonth.month() + 1; // month is 0-indexed in moment.js
    const year = lastMonth.year();

    const studentsWithOrders = await Order.aggregate([
        {
            $match: {
                status: 'PickedUp',
                createdAt: {
                    $gte: lastMonth.clone().startOf('month').utc().toDate(),
                    $lte: lastMonth.clone().endOf('month').utc().toDate(),
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

    if (!studentsWithOrders.length) {
        console.log('ℹ️ No students with picked up orders for billing period.');
        return;
    }

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

    await Bill.bulkWrite(operations);

    console.log(`💸 Automated billing completed for ${month + 1}/${year}`);
    return;
});

const deleteOldOrders = tryCatch('clean old orders', async () => {
    // Get the start of the month, two months ago
    await Order.deleteMany({
        createdAt: {
            $lt: moment()
                .subtract(2, 'months')
                .tz('Asia/Kolkata')
                .startOf('month')
                .toDate(),
        },
    });

    console.log('🧹 Cleanup completed');
    return;
});

const startBillingCronJob = () => {
    // Run at 12:05 on the 1st of every month
    cron.schedule(
        '5 0 1 * *',
        async () => {
            console.log(
                `[CRON] Generating bills at ${new Date().toLocaleString()}`
            );
            await generateBills();
        },
        {
            scheduled: true,
            timezone: 'Asia/Kolkata',
        }
    );

    console.log('💵 Billing scheduled for every month at 12:05 AM');
};

const startCleanupCronJob = () => {
    // Run at 12:05 AM on the 1st of every month
    cron.schedule(
        '5 0 1 * *',
        async () => {
            console.log(
                `[CRON] Cleaning up old orders at ${new Date().toLocaleString()}`
            );
            await deleteOldOrders();
        },
        {
            scheduled: true,
            timezone: 'Asia/Kolkata',
        }
    );

    console.log('🧹 Cleanup scheduled for every month at 12:05 AM');
};

export { startBillingCronJob, startCleanupCronJob };

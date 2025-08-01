import { Bill, Order } from '../Models/index.js';
import cron from 'node-cron';
import moment from 'moment-timezone';

async function generateBills() {
    try {
        const lastMonth = moment().tz('Asia/Kolkata').subtract(1, 'month');
        const month = lastMonth.month() + 1; // month is 0-indexed in moment.js
        const year = lastMonth.year();

        console.log(`📅 Generating bills for ${month}/${year}`);

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

        if (studentsWithOrders.length) {
            console.log(
                `👥 Found ${studentsWithOrders.length} students with orders.`
            );
        } else {
            console.log(
                'ℹ️ No students with picked up orders for this period.'
            );
            return;
        }

        const operations = studentsWithOrders.map((student) => ({
            updateOne: {
                filter: { studentId: student._id, month, year },
                update: {
                    $setOnInsert: {
                        studentId: student._id,
                        canteenId: student.canteenId,
                        amount: student.totalAmount,
                        month,
                        year,
                    },
                },
                upsert: true,
            },
        }));

        const result = await Bill.bulkWrite(operations);

        console.log(
            `💸 Billing completed: ${result.upsertedCount} new bills, ${result.modifiedCount} updated`
        );

        return result;
    } catch (error) {
        console.error('❌ Error during billing cron job:', error);
    }
}

async function deleteOldOrders() {
    try {
        // Get the start of the month, two months ago
        const cutoffDate = moment()
            .tz('Asia/Kolkata')
            .subtract(2, 'months')
            .startOf('month')
            .toDate();

        console.log(
            `📅 Deleting orders older than: ${cutoffDate.toISOString()}`
        );

        const result = await Order.deleteMany({
            createdAt: { $lt: cutoffDate },
        });

        console.log(
            `🧹 Cleanup completed: ${result.deletedCount} orders deleted`
        );

        return result;
    } catch (error) {
        console.error('❌ Error during cleanup cron job:', error);
    }
}

export const startBillingCronJob = () => {
    console.log('💵 Billing scheduled on 1st of every month at 12:05 AM');

    cron.schedule('5 0 1 * *', async () => {
        await generateBills();
    });
};

export const startCleanupCronJob = () => {
    console.log('🧹 Cleanup scheduled on 1st of every month at 12:05 AM');

    cron.schedule('10 0 1 * *', async () => {
        await deleteOldOrders();
    });
};

export const testCronJob = () => {
    // Every second
    cron.schedule('* * * * * *', async () => {
        console.log(`[TEST] Running at ${new Date().toISOString()}`);
    });
};

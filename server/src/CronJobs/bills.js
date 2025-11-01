import { Bill, Order } from '../Models/index.js';
import cron from 'node-cron';
import moment from 'moment-timezone';
import { TAX } from '../Constants/index.js';

export async function generateBills() {
    try {
        const lastMonth = moment().tz('Asia/Kolkata').subtract(1, 'month');
        const month = lastMonth.month() + 1;
        const year = lastMonth.year();

        console.log(`📅 Generating bills for ${month}/${year}`);

        const studentsWithOrders = await Order.aggregate([
            {
                $match: {
                    status: { $in: ['Prepared', 'PickedUp'] },
                    createdAt: {
                        $gte: lastMonth.clone().startOf('month').toDate(),
                        $lte: lastMonth.clone().endOf('month').toDate(),
                    },
                },
            },
            {
                $group: {
                    _id: '$studentId',
                    totalAmount: { $sum: '$amount' },
                    totalExtra: { $sum: '$extraCharges' },
                    canteenId: { $first: '$canteenId' },
                },
            },
        ]);

        console.log(studentsWithOrders);

        if (!studentsWithOrders.length) {
            console.log('ℹ️ No students with prepared orders for this period.');
            return;
        }

        console.log(
            `👥 Found ${studentsWithOrders.length} students with orders.`
        );

        const operations = studentsWithOrders.map((student) => {
            const subtotal = student.totalAmount + student.totalExtra;
            const tax = subtotal * TAX;
            const grandTotal = subtotal + tax;

            return {
                updateOne: {
                    filter: { studentId: student._id, month, year },
                    update: {
                        $set: { amount: subtotal, tax, grandTotal },
                        $setOnInsert: {
                            studentId: student._id,
                            canteenId: student.canteenId,
                            month,
                            year,
                        },
                    },
                    upsert: true,
                },
            };
        });

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

    return cron.schedule(
        '5 0 1 * *',
        async () => {
            await generateBills();
        },
        { timezone: 'Asia/Kolkata' }
    );
};

export const startCleanupCronJob = () => {
    // console.log('🧹 Cleanup scheduled on 2nd of every month at 12:05 AM');
    // return cron.schedule(
    //     '5 0 2 * *',
    //     async () => {
    //         await deleteOldOrders();
    //     },
    //     { timezone: 'Asia/Kolkata' }
    // );
};

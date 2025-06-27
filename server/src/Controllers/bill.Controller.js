import { NOT_FOUND, OK } from '../Constants/index.js';
import { ErrorHandler, tryCatch } from '../Utils/index.js';
import { Bill, Canteen, Order, Student } from '../Models/index.js';
import { Types } from 'mongoose';
import cron from 'node-cron';
import moment from 'moment';

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
    const { page = 1, limit = 10, month = moment().month() } = req.query;

    const bills = await Bill.aggregatePaginate(
        [
            {
                $match: {
                    canteenId: new Types.ObjectId(contractor.canteenId),
                    month: parseInt(month),
                    year: moment().year(),
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

// generate bill for a specific student in mid of the current month
const generateIntermediateBill = tryCatch(
    'generate intermediate bill for student',
    async (req, res, next) => {
        const { rollNo } = req.params;
        const { canteenId } = req.user;

        const canteen = await Canteen.findById(canteenId).select(
            'hostelType hostelNumber'
        );
        const { hostelType, hostelNumber } = canteen;

        const userName = `${hostelType}${hostelNumber}-${rollNo}`;

        const student = await Student.findOne({ userName }).select(
            '-refreshToken -password'
        );

        if (!student) {
            return next(new ErrorHandler('Student Not found', NOT_FOUND));
        }

        // get orders of current month (picked up) and prepare bill
        const [bill] = await Order.aggregate([
            {
                $match: {
                    studentId: student._id,
                    createdAt: {
                        $gte: moment().startOf('month').toDate(),
                        $lte: moment().endOf('month').toDate(),
                    },
                    status: 'PickedUp',
                },
            },
            {
                $group: {
                    _id: '$studentId',
                    totalAmount: { $sum: '$amount' },
                },
            },
        ]);

        return res.status(OK).json({
            studentInfo: student,
            canteenId,
            amount: bill ? bill.totalAmount : 0,
        });
    }
);

// generate bills for the previous month
const generateBills = tryCatch('generate bills', async (req, res) => {
    const lastMonth = moment().subtract(1, 'month');
    const month = lastMonth.month() + 1; // month is 0-indexed in moment.js
    const year = lastMonth.year();

    const studentsWithOrders = await Order.aggregate([
        {
            $match: {
                status: 'PickedUp',
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
                canteenId: { $first: '$canteenId' },
            },
        },
    ]);

    if (!studentsWithOrders.length) {
        console.log('ℹ️ No students with picked up orders for billing period.');
        if (res) res.status(OK).json({ message: 'No bills generated' });
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

    if (res)
        res.status(OK).json({
            message: `bills generated for ${month + 1}/${year}`,
        });
    return;
});

const startBillingCronJob = () => {
    // Run at 12:05 on the 1st of every month
    cron.schedule('5 0 1 * *', generateBills, {
        scheduled: true,
        timezone: 'Asia/Kolkata',
    });

    console.log('💵 Billing scheduled for every month at 12:05 AM');
};

const startCleanupCronJob = () => {
    // Run at 12:05 AM on the 1st of every month
    cron.schedule(
        '5 0 1 * *',
        tryCatch('clean old orders', async () => {
            // Get the start of the month, two months ago
            const thresholdDate = moment()
                .subtract(2, 'months')
                .startOf('month');

            console.log(
                `🧹 Cleaning up... Deleting orders created before ${thresholdDate.format()}`
            );

            await Order.deleteMany({
                createdAt: { $lt: thresholdDate.toDate() },
            });

            console.log('🧹 Cleanup completed');
        }),
        {
            scheduled: true,
            timezone: 'Asia/Kolkata',
        }
    );

    console.log('🧹 Cleanup scheduled for every month at 12:05 AM');
};

export {
    generateBills,
    getBills,
    generateIntermediateBill,
    getStudentBills,
    startBillingCronJob,
    startCleanupCronJob,
};

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
        { paid: true, paidDate: new Date() },
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
    const month = lastMonth.getMonth() + 1; // Months are 0-indexed in JS
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
    console.log(`Automated billing completed for ${month}/${year}`);
});

// Schedule the cron job to run on the 1st of every month at 12:05 AM
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

export {
    markPaid,
    generateBill,
    getBills,
    getStudentBills,
    startBillingCronJob,
};

import { OK } from '../Constants/index.js';
import { tryCatch } from '../Utils/index.js';
import { Bill, Order } from '../Models/index.js';
import { Types } from 'mongoose';

const getStudentBills = tryCatch('get student bills', async (req, res) => {
    const { studentId } = req.params;
    const bills = await Bill.find({
        studentId: new Types.ObjectId(studentId),
    }).sort({ createdAt: -1 });

    if (bills.length) {
        return res.status(OK).json(bills);
    } else {
        return res.status(OK).json({ message: 'no bills found' });
    }
});

const getBills = tryCatch('get bills', async (req, res) => {
    const contractor = req.user;
    const bills = await Bill.find({
        canteenId: new Types.ObjectId(contractor.canteenId),
    }).sort({ createdAt: -1 });

    if (bills.length) {
        return res.status(OK).json(bills);
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
        {
            paid: true,
            paidDate: new Date(),
        },
        { new: true }
    );
    if (!bill) {
        return res.status(404).json({ message: 'bill not found' });
    }
    return res.status(OK).json({ message: 'bill marked as paid' });
});

const generateBill = tryCatch('generate bill', async (req, res) => {
    const { month, year } = req.body;
    const { studentId } = req.params;
    const contractor = req.user;

    // get that month's orders
    const orders = await Order.find({
        studentId: new Types.ObjectId(studentId),
        status: 'PickedUp',
        createdAt: {
            $gte: new Date(`${year}-${month}-01`),
            $lt: new Date(`${year}-${month}-31`),
        },
    }).select('_id amount');

    const orderIds = orders.map((o) => o._id);
    const amount = orders.reduce((acc, o) => acc + o.amount, 0);

    const bill = await Bill.create({
        studentId,
        canteenId: contractor.canteenId,
        month,
        year,
        amount,
        orderIds,
    });

    return res.status(OK).json(bill);
});

export { markPaid, generateBill, getBills, getStudentBills };

import { NOT_FOUND, OK, TAX } from '../Constants/index.js';
import { ErrorHandler, getRollNo, tryCatch } from '../Utils/index.js';
import { Bill, Canteen, Order, Student } from '../Models/index.js';
import { Types } from 'mongoose';
import moment from 'moment';
import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';

export const getStudentBills = tryCatch(
    'get student bills',
    async (req, res) => {
        const { studentId } = req.params;
        const bills = await Bill.find({
            studentId: new Types.ObjectId(studentId),
        }).sort({ month: -1, year: -1 });

        if (bills.length) {
            return res.status(OK).json(bills);
        } else {
            return res.status(OK).json({ message: 'no bills found' });
        }
    }
);

export const getBills = tryCatch('get bills', async (req, res) => {
    const contractor = req.user;
    const {
        page = 1,
        limit = 10,
        month = moment().month(),
        search = '',
    } = req.query;

    const matchStage = {
        canteenId: new Types.ObjectId(contractor.canteenId),
        month: parseInt(month),
        year: moment().year(),
    };

    const [bills, [totalBills]] = await Promise.all([
        Bill.aggregatePaginate(
            [
                { $match: matchStage },
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
                                },
                            },
                            {
                                $addFields: {
                                    rollSuffix: {
                                        $arrayElemAt: [
                                            { $split: ['$userName', '-'] },
                                            1,
                                        ],
                                    },
                                },
                            },
                            {
                                $addFields: {
                                    rollNumber: { $toInt: '$rollSuffix' },
                                },
                            },
                            ...(search
                                ? [
                                      {
                                          $match: {
                                              $or: [
                                                  {
                                                      fullName: {
                                                          $regex: search,
                                                          $options: 'i',
                                                      },
                                                  },
                                                  {
                                                      rollSuffix: {
                                                          $regex: search,
                                                          $options: 'i',
                                                      },
                                                  },
                                              ],
                                          },
                                      },
                                  ]
                                : []),
                        ],
                    },
                },
                { $unwind: '$studentInfo' },
                {
                    $sort: { 'studentInfo.rollNumber': 1, createdAt: -1 },
                },
            ],
            {
                page: parseInt(page),
                limit: parseInt(limit),
            }
        ),

        // total amount
        Bill.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$grandTotal' },
                },
            },
        ]),
    ]);

    if (bills.docs.length) {
        return res.status(OK).json({
            bills: bills.docs,
            billsInfo: {
                totalAmount: totalBills.totalAmount || 0,
                totalCount: bills.totalDocs,
                hasNextPage: bills.hasNextPage,
                hasPrevPage: bills.hasPrevPage,
            },
        });
    } else {
        return res.status(OK).json({ message: 'no bills found' });
    }
});

// generate bill for a specific student in mid of the current month
export const generateIntermediateBill = tryCatch(
    'generate intermediate bill for student',
    async (req, res) => {
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
            throw new ErrorHandler('Student Not found', NOT_FOUND);
        }

        // get orders of current month (picked up) and prepare bill
        const [bill] = await Order.aggregate([
            {
                $match: {
                    studentId: student._id,
                    createdAt: {
                        $gte: moment()
                            .tz('Asia/Kolkata')
                            .startOf('month')
                            .toDate(),
                        $lte: moment()
                            .tz('Asia/Kolkata')
                            .endOf('month')
                            .toDate(),
                    },
                    status: 'Prepared',
                },
            },
            {
                $group: {
                    _id: '$studentId',
                    totalAmount: { $sum: '$amount' },
                },
            },
        ]);

        const subtotal = bill ? bill.totalAmount : 0;
        const tax = subtotal * TAX;
        const grandTotal = subtotal + tax;

        return res.status(OK).json({
            studentInfo: student,
            canteenId,
            amount: subtotal,
            tax,
            grandTotal,
        });
    }
);

export const generateIntermediateBillsForAll = tryCatch(
    'generate intermediate bills for all students',
    async (req, res) => {
        const { canteenId } = req.user;

        const students = await Student.find({ canteenId });

        if (!students.length) {
            throw new ErrorHandler('no students found', BAD_REQUEST);
        }

        const bills = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: moment()
                            .tz('Asia/Kolkata')
                            .startOf('month')
                            .toDate(),
                        $lte: moment()
                            .tz('Asia/Kolkata')
                            .endOf('month')
                            .toDate(),
                    },
                    status: 'Prepared',
                },
            },
            {
                $group: {
                    _id: '$studentId',
                    subtotal: { $sum: '$amount' },
                },
            },
            {
                $addFields: {
                    tax: { $multiply: ['$subtotal', TAX] },
                    grandTotal: {
                        $add: ['$subtotal', { $multiply: ['$subtotal', TAX] }],
                    },
                },
            },
        ]);

        const studentMap = Object.fromEntries(
            students.map((s) => [s._id.toString(), s])
        );

        const data = bills.map((b) => ({
            fullName: studentMap[b._id]?.fullName,
            rollNo: getRollNo(studentMap[b._id]?.userName) || '-',
            subtotal: b.subtotal,
            taxes: b.tax,
            grandTotal: b.grandTotal,
        }));

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Student_Bills');

        worksheet.columns = [
            { header: 'Full Name', key: 'fullName', width: 20 },
            { header: 'Roll No', key: 'rollNo', width: 10 },
            { header: 'Sub total', key: 'subtotal', width: 25 },
            { header: 'Taxes', key: 'taxes', width: 25 },
            { header: 'Grand Total', key: 'grandTotal', width: 25 },
        ];

        worksheet.addRows(data);

        const headerRow = worksheet.getRow(1);
        headerRow.eachCell((cell) => {
            cell.font = { bold: true };
            cell.alignment = { horizontal: 'center' };
        });

        const fileName = 'bills.xlsx';
        const tempDir = path.join(process.cwd(), 'public', 'temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
        const filePath = path.join(tempDir, fileName);

        await workbook.xlsx.writeFile(filePath);

        return res.download(filePath, fileName, (err) => {
            if (err) console.error('Error sending file:', err);
            fs.unlink(filePath, () => {}); // delete temp file
        });
    }
);

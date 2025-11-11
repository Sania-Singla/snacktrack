import {
    OK,
    BAD_REQUEST,
    NOT_FOUND,
    CREATED,
    FORBIDDEN,
    HOSTELS,
    COOKIE_OPTIONS,
} from '../Constants/index.js';
import {
    verifyExpression,
    tryCatch,
    ErrorHandler,
    sendVerificationEmail,
    verifyEmail,
    sendMail,
    genQR,
    getRollNo,
} from '../Utils/index.js';
import { Bill, Canteen, Contractor, Order, Student } from '../Models/index.js';
import { nanoid } from 'nanoid';
import { generateAccessToken } from '../Helpers/tokens.js';
import bcrypt from 'bcryptjs';
import ExcelJS from 'exceljs';
import archiver from 'archiver';
import path from 'path';
import { Types } from 'mongoose';
import fs from 'fs';

export const verifyAdminKey = tryCatch('verify admin key', async (req, res) => {
    const { key } = req.body;

    if (!key) {
        throw new ErrorHandler('missing key', BAD_REQUEST);
    }

    if (key !== process.env.ADMIN_KEY) {
        return res.status(BAD_REQUEST).json({ message: 'Invalid key' });
    }

    const token = await generateAccessToken({ role: 'admin' });

    return res
        .status(OK)
        .cookie('accessToken', token, {
            ...COOKIE_OPTIONS,
            maxAge: Number(process.env.ACCESS_TOKEN_MAXAGE),
        })
        .clearCookie('refreshToken', COOKIE_OPTIONS)
        .json({
            user: {
                role: 'admin',
            },
        });
});

export const proceedAsAdmin = tryCatch('proceed as admin', async (req, res) => {
    const { key } = req.body; // kitchen key
    const { canteenId } = req.params;

    if (!key) {
        throw new ErrorHandler('missing key', BAD_REQUEST);
    }

    const contractor = await Contractor.findOne({ canteenId })
        .populate('canteenId', 'hostelType hostelNumber hostelName isOpen')
        .select('-refreshToken')
        .lean();

    if (!contractor) {
        throw new ErrorHandler('contractor not found', NOT_FOUND);
    }

    const isValid = await bcrypt.compare(key, contractor.password);
    if (!isValid) throw new ErrorHandler('invalid key', BAD_REQUEST);

    const accessToken = await generateAccessToken({
        canteenId,
        role: 'admin',
    });

    const hostelType = contractor.canteenId.hostelType;
    const hostelNumber = contractor.canteenId.hostelNumber;
    const hostelName = contractor.canteenId.hostelName;
    const isOpen = contractor.canteenId.isOpen;
    contractor.canteenId = canteenId;

    const { password: _, ...rest } = contractor;

    return res
        .status(OK)
        .cookie('accessToken', accessToken, {
            ...COOKIE_OPTIONS,
            maxAge: Number(process.env.ACCESS_TOKEN_MAXAGE),
        })
        .clearCookie('refreshToken', COOKIE_OPTIONS)
        .json({
            role: 'admin',
            ...rest,
            isOpen,
            hostelType,
            hostelNumber,
            hostelName,
        });
});

export const registerCanteen = tryCatch(
    'register as contractor',
    async (req, res) => {
        let { fullName, email, phoneNumber, hostel } = req.body;
        fullName = fullName?.trim();
        email = email?.toLowerCase().trim();
        phoneNumber = phoneNumber?.trim();

        if (!fullName || !email || !phoneNumber || !hostel) {
            throw new ErrorHandler('Missing fields', BAD_REQUEST);
        }

        let { hostelName, hostelNumber, hostelType } = hostel;
        hostelName = hostelName.trim();
        hostelType = hostelType.trim();

        const isValid = ['fullName', 'email', 'phoneNumber'].every((key) =>
            verifyExpression(key, req.body[key]?.trim())
        );

        if (!isValid) {
            throw new ErrorHandler('Invalid input data', BAD_REQUEST);
        }

        // single canteen -> single contractor & single contractor -> single canteen
        const [existingCanteen, existingContractor] = await Promise.all([
            Canteen.findOne({
                $or: [
                    { hostelName },
                    { $and: [{ hostelNumber }, { hostelType }] },
                ],
            }),
            Contractor.findOne({
                $or: [{ email }, { phoneNumber }],
            }),
        ]);

        if (existingCanteen) {
            throw new ErrorHandler('canteen already exists', NOT_FOUND);
        }

        if (existingContractor) {
            throw new ErrorHandler('contractor already exists', BAD_REQUEST);
        }

        // Now register the contractor & canteen
        const canteen = await Canteen.create({
            hostelName: hostel.hostelName.trim(),
            hostelNumber: hostel.hostelNumber,
            hostelType: hostel.hostelType.trim(),
        });

        const randomPassword = nanoid(8); // unique temporary random password

        // password & kitchenKey hashing auto done by pre hooks
        const contractor = await Contractor.create({
            fullName,
            email,
            phoneNumber,
            password: randomPassword,
            canteenId: canteen._id,
        });

        // link contractor to canteen
        canteen.contractorId = contractor._id;
        await canteen.save();

        const {
            password: _,
            refreshToken: __,
            ...rest
        } = contractor.toObject();

        // send this password on contractor's email
        sendMail({
            receiverName: fullName,
            receiverMail: email,
            subject: 'Welcome to SnackTrack',
            html: `
                Hello ${fullName}, <br>
                Welcome to SnackTrack! <br>
                You are now the manager of the canteen of Hostel: ${hostel.hostelType}${hostel.hostelNumber}-${hostel.hostelName}. <br>
                Your Temporary password is <b>${randomPassword}</b>
            `,
        });

        return res.status(CREATED).json(rest);
    }
);

export const sendVerificationCode = tryCatch(
    'send verification email',
    async (req, res) => {
        const { fullName, email } = req.body;
        if (!fullName || !email) {
            return res.status(BAD_REQUEST).json({ message: 'missing Fields' });
        }

        await sendVerificationEmail(fullName, email.trim());

        return res.status(OK).json({ message: 'Verification code sent' });
    }
);

export const verifyCode = tryCatch('verify email', async (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(BAD_REQUEST).json({ message: 'missing Fields' });
    }

    const isVerified = await verifyEmail(email, code);
    if (!isVerified) {
        return res
            .status(FORBIDDEN)
            .json({ message: 'Please verify you email.' });
    }

    return res.status(OK).json({ message: 'Email verified Successfully' });
});

export const getContractors = tryCatch('get contractors', async (req, res) => {
    const canteens = await Canteen.aggregate([
        {
            $lookup: {
                from: 'contractors',
                localField: 'contractorId',
                foreignField: '_id',
                as: 'contractor',
                pipeline: [
                    {
                        $project: {
                            fullName: 1,
                            email: 1,
                            phoneNumber: 1,
                        },
                    },
                ],
            },
        },
        { $unwind: '$contractor' },
        { $project: { snacks: 0, packagedItems: 0 } },
    ]);

    return res.status(OK).json(canteens);
});

export const getHostels = tryCatch('get hostels', async (req, res) => {
    return res.status(OK).json(HOSTELS);
});

export const updatePassword = tryCatch('update password', async (req, res) => {
    const { newPassword } = req.body;
    const { _id } = req.user;

    const isValid = verifyExpression('password', newPassword);
    if (!isValid) throw new ErrorHandler('invalid password', BAD_REQUEST);

    // hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await Contractor.findByIdAndUpdate(
        _id,
        { $set: { password: hashedNewPassword } },
        { new: false } // i dont need the updated document back
    );

    return res.status(OK).json({ message: 'password updated successfully' });
});

export const updateAccountDetails = tryCatch(
    'update account details',
    async (req, res) => {
        const { _id } = req.user;
        const { fullName, email, phoneNumber } = req.body;
        const data = { fullName, email, phoneNumber };

        // input error handling
        if (!fullName || !email || !phoneNumber) {
            throw new ErrorHandler('missing fields', BAD_REQUEST);
        }

        for (const [key, value] of Object.entries(data)) {
            if (value) {
                const isValid = verifyExpression(key, value);
                if (!isValid) {
                    throw new ErrorHandler(`${key} is invalid.`, BAD_REQUEST);
                }
            }
        }

        const duplicate = await Contractor.findOne({
            _id: { $ne: _id },
            $or: [{ email }, { phoneNumber }],
        });

        if (duplicate) {
            throw new ErrorHandler(
                'email or phone number already in use',
                BAD_REQUEST
            );
        }

        await Contractor.findByIdAndUpdate(
            _id,
            { $set: { fullName, email, phoneNumber } },
            { new: false }
        );

        return res
            .status(OK)
            .json({ message: 'account details updated successfully' });
    }
);

export const registerStudent = tryCatch(
    'register student',
    async (req, res) => {
        const contractor = req.user;
        const {
            fullName,
            rollNo,
            phoneNumber,
            email,
            hostelType,
            hostelNumber,
        } = req.body;

        if (
            !fullName ||
            !email ||
            !phoneNumber ||
            !rollNo ||
            !hostelType ||
            !hostelNumber
        ) {
            throw new ErrorHandler('Missing fields', BAD_REQUEST);
        }

        const isValid = ['fullName', 'email', 'phoneNumber', 'rollNo'].every(
            (key) => verifyExpression(key, req.body[key]?.trim())
        );
        if (!isValid) {
            throw new ErrorHandler('Invalid input data', BAD_REQUEST);
        }

        const userName = (hostelType + hostelNumber + '-' + rollNo).trim();

        const existingStudent = await Student.findOne({
            $or: [
                { userName: userName.trim() },
                { phoneNumber: phoneNumber.trim() },
                { email: email.trim() },
            ],
        });

        if (existingStudent) {
            throw new ErrorHandler('user already exists', BAD_REQUEST);
        }

        const randomPassword = nanoid(8); // unique temporary random password

        const student = await Student.create({
            fullName,
            canteenId: contractor.canteenId,
            userName,
            phoneNumber,
            email,
            password: randomPassword,
        });

        const qrDataURL = await genQR({
            _id: student._id,
            passHash: student.password,
        });

        const base64Data = qrDataURL.replace(/^data:image\/png;base64,/, '');

        const fileName = `${getRollNo(student.userName)}.png`;

        const tempDir = path.join(process.cwd(), 'public', 'temp');

        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const qrFilePath = path.join(tempDir, fileName);
        fs.writeFileSync(qrFilePath, base64Data, 'base64');

        return res.download(qrFilePath, fileName, (err) => {
            fs.unlink(qrFilePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error('Failed to delete temp QR file:', unlinkErr);
                }
            });

            if (err) {
                console.error('Error sending file:', err);
            }
        });
    }
);

export const registerBulkStudents = tryCatch(
    'bulk registration',
    async (req, res) => {
        const contractor = req.user;
        const { hostelNumber, hostelType } = req.body;

        const file = req.file?.path;
        if (!file) {
            throw new ErrorHandler('No Excel file uploaded', BAD_REQUEST);
        }

        let workbook, worksheet, rows;

        try {
            // --- Read Excel file ---
            workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(file);
            worksheet = workbook.worksheets[0];

            const headers = worksheet.getRow(1).values.slice(1);
            rows = [];

            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber === 1) return;
                const rowData = {};

                headers.forEach((header, index) => {
                    const cell = row.getCell(index + 1);
                    if (header && cell.value != null) {
                        rowData[header] = (
                            cell.text || String(cell.value)
                        ).trim();
                    }
                });

                if (
                    rowData.rollNo &&
                    rowData.fullName &&
                    rowData.email &&
                    rowData.phoneNumber
                ) {
                    rows.push(rowData);
                }
            });

            if (!rows.length) {
                throw new ErrorHandler(
                    'Invalid format. Ensure columns are: rollNo, fullName, email, phoneNumber',
                    BAD_REQUEST
                );
            }

            // Remove duplicate rows inside Excel itself
            const seen = new Set();
            const uniqueRows = [];

            for (const r of rows) {
                const key = [
                    r.email.toLowerCase().trim(),
                    r.phoneNumber.trim(),
                    r.rollNo.trim(),
                ].join('|');

                if (!seen.has(key)) {
                    seen.add(key);
                    uniqueRows.push(r);
                }
            }

            if (!uniqueRows.length) {
                throw new ErrorHandler(
                    'Invalid format or all rows are duplicates inside the Excel file',
                    BAD_REQUEST
                );
            }

            // Prepare DB-level duplicate check
            const emails = [];
            const phoneNumbers = [];
            const userNames = [];

            uniqueRows.forEach((u) => {
                emails.push(u.email.toLowerCase().trim());
                phoneNumbers.push(u.phoneNumber.trim());
                userNames.push(
                    `${hostelType}${hostelNumber}-${u.rollNo}`.trim()
                );
            });

            const existing = await Student.find({
                $or: [
                    { email: { $in: emails } },
                    { userName: { $in: userNames } },
                    { phoneNumber: { $in: phoneNumbers } },
                ],
            })
                .select('email userName phoneNumber')
                .lean();

            const existingSet = new Set(
                existing.flatMap((u) => [
                    u.email.toLowerCase(),
                    u.userName,
                    u.phoneNumber,
                ])
            );

            // Build final docs for insertion (after Excel-level + DB-level check)
            const userDocs = [];

            for (let i = 0; i < uniqueRows.length; i++) {
                const u = uniqueRows[i];
                const email = u.email.toLowerCase().trim();
                const phone = u.phoneNumber.trim();
                const userName = userNames[i];

                if (
                    !existingSet.has(email) &&
                    !existingSet.has(userName) &&
                    !existingSet.has(phone)
                ) {
                    const hash = await bcrypt.hash(nanoid(8), 10);

                    userDocs.push({
                        fullName: u.fullName,
                        canteenId: contractor.canteenId,
                        userName,
                        phoneNumber: phone,
                        email,
                        password: hash,
                    });
                }
            }

            if (!userDocs.length) {
                throw new ErrorHandler(
                    'No new registrations found',
                    BAD_REQUEST
                );
            }

            // --- Insert into DB ---
            const inserted = await Student.insertMany(userDocs, {
                ordered: false,
            });

            console.log(`Inserted ${inserted.length} students successfully`);

            // QR Code Generation
            const tempDir = path.join(process.cwd(), 'public', 'temp');
            const qrDir = path.join(tempDir, `qrs-${Date.now()}`);
            fs.mkdirSync(qrDir, { recursive: true });

            const BATCH_SIZE = 50;
            for (let i = 0; i < inserted.length; i += BATCH_SIZE) {
                const batch = inserted.slice(i, i + BATCH_SIZE);

                await Promise.all(
                    batch.map(async (student) => {
                        const qrDataURL = await genQR({
                            _id: student._id,
                            passHash: student.password,
                        });

                        const base64Data = qrDataURL.replace(
                            /^data:image\/png;base64,/,
                            ''
                        );

                        const fileName = `${getRollNo(student.userName)}.png`;
                        const qrFilePath = path.join(qrDir, fileName);

                        await fs.promises.writeFile(
                            qrFilePath,
                            base64Data,
                            'base64'
                        );
                    })
                );
            }

            // Create ZIP
            const zipFileName = `${hostelType}-${hostelNumber}.zip`;
            const zipPath = path.join(tempDir, zipFileName);

            await new Promise((resolve, reject) => {
                const output = fs.createWriteStream(zipPath);
                const archive = archiver('zip', { zlib: { level: 9 } });

                output.on('close', resolve);
                archive.on('error', reject);

                archive.pipe(output);
                archive.directory(qrDir, false);
                archive.finalize();
            });

            fs.unlinkSync(file);

            // Download ZIP + Cleanup
            return res.download(zipPath, zipFileName, (err) => {
                fs.promises
                    .rm(qrDir, { recursive: true, force: true })
                    .catch(console.error);
                fs.promises.unlink(zipPath).catch(console.error);

                if (err) {
                    console.error('Download error:', err);
                }
            });
        } catch (err) {
            if (file && fs.existsSync(file)) {
                fs.unlinkSync(file);
            }
            throw err;
        }
    }
);

export const removeStudent = tryCatch('remove student', async (req, res) => {
    const { studentId } = req.params;
    const contractor = req.user;

    // check if bills are pending
    const pendingBill = await Bill.findOne({
        studentId: new Types.ObjectId(studentId),
        paid: false,
    });

    if (pendingBill) {
        throw new ErrorHandler('student has pending bills', BAD_REQUEST);
    }

    // a contractor can remove the student only if the student belongs to his canteen
    const [student] = await Promise.all([
        Student.findOneAndDelete({
            _id: new Types.ObjectId(studentId),
            canteenId: new Types.ObjectId(contractor.canteenId),
        }),
        Order.deleteMany({
            studentId: new Types.ObjectId(studentId),
        }),
        Bill.deleteMany({
            studentId: new Types.ObjectId(studentId),
        }),
    ]);
    if (!student) {
        throw new ErrorHandler('student not found', NOT_FOUND);
    }

    return res.status(OK).json({ message: 'account deleted successfully' });
});

export const updateStudent = tryCatch('update student', async (req, res) => {
    const contractor = req.user;
    const { studentId } = req.params;
    const { fullName, phoneNumber, email, rollNo, hostelNumber, hostelType } =
        req.body;

    const student = await Student.findOne({
        _id: new Types.ObjectId(studentId),
        canteenId: new Types.ObjectId(contractor.canteenId),
    });

    if (!student) {
        throw new ErrorHandler('student not found', NOT_FOUND);
    }

    let alreadyExists = null;
    const newUserName = hostelType + hostelNumber + '-' + rollNo;

    if (student.userName !== newUserName) {
        alreadyExists = await Student.findOne({ userName: newUserName });
    } else if (student.phoneNumber !== phoneNumber) {
        alreadyExists = await Student.findOne({ phoneNumber });
    } else if (student.email !== email.toLowerCase()) {
        alreadyExists = await Student.findOne({
            email: email.toLowerCase(),
        });
    }
    if (alreadyExists) {
        throw new ErrorHandler('user already exists', BAD_REQUEST);
    }

    const updatedStudent = await Student.findByIdAndUpdate(
        studentId,
        {
            $set: {
                userName: newUserName,
                phoneNumber,
                fullName,
                email,
            },
        },
        { new: true }
    );

    const {
        password: _,
        refreshToken: __,
        ...rest
    } = updatedStudent.toObject();

    return res.status(OK).json(rest);
});

// ! CRITICAL
export const removeAllStudents = tryCatch(
    'remove all students',
    async (req, res) => {
        const { password } = req.body;
        const contractor = req.user;
        if (!password) {
            throw new ErrorHandler('missing fields', BAD_REQUEST);
        }

        const isPassValid = await bcrypt.compare(password, contractor.password);
        if (!isPassValid) {
            throw new ErrorHandler('invalid credentials', BAD_REQUEST);
        }

        await Promise.all([
            Student.deleteMany({
                canteenId: new Types.ObjectId(contractor.canteenId),
            }),
            Order.deleteMany({
                cateenId: new Types.ObjectId(contractor.canteenId),
            }),
            Bill.deleteMany({
                canteenId: new Types.ObjectId(contractor.canteenId),
            }),
        ]);

        return res
            .status(OK)
            .json({ message: 'all students removed successfully' });
    }
);

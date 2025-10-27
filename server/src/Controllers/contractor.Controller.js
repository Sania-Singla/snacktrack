import {
    OK,
    BAD_REQUEST,
    NOT_FOUND,
    CREATED,
    SOCKET_EVENTS,
} from '../Constants/index.js';
import bcrypt from 'bcryptjs';
import {
    verifyExpression,
    tryCatch,
    ErrorHandler,
    sendMail,
    genQR,
    getRollNo,
} from '../Utils/index.js';
import { uploadOnCloudinary, deleteFromCloudinary } from '../Helpers/index.js';
import { nanoid } from 'nanoid';
import {
    Snack,
    Student,
    PackagedFood,
    Order,
    Bill,
    Canteen,
} from '../Models/index.js';
import { Types } from 'mongoose';
import fs from 'fs';
import { io } from '../socket.js';
import ExcelJS from 'exceljs';
import archiver from 'archiver';
import path from 'path';

// canteen management

export const changeCanteenStatus = tryCatch(
    'change canteen status',
    async (req, res) => {
        const contractor = req.user;
        const { status } = req.body;

        await Canteen.findByIdAndUpdate(contractor.canteenId, {
            isOpen: status,
        });

        io.emit(SOCKET_EVENTS.CANTEEN_OPEN_STATUS_CHANGED, {
            isOpen: status,
            canteenId: contractor.canteenId,
        });
        return res.status(OK).json({
            message: `canteen ${status ? 'opened' : 'closed'} successfully`,
        });
    }
);

// student management

export const getStudents = tryCatch('get students', async (req, res) => {
    const { limit = 10, page = 1, search = '' } = req.query;
    const user = req.user;

    const project =
        user.role === 'contractor'
            ? {
                  project: {
                      phoneNumber: 0,
                      email: 0,
                  },
              }
            : {};

    const result = await Student.aggregatePaginate(
        [
            {
                $match: {
                    canteenId: new Types.ObjectId(req.user.canteenId),
                    ...(search && {
                        $or: [
                            { fullName: { $regex: search, $options: 'i' } },
                            {
                                $expr: {
                                    $regexMatch: {
                                        input: {
                                            $arrayElemAt: [
                                                { $split: ['$userName', '-'] },
                                                1,
                                            ],
                                        },
                                        regex: `^${search}$`, // strict match with roll number only
                                        options: 'i',
                                    },
                                },
                            },
                        ],
                    }),
                },
            },
            { $project: { password: 0, refreshToken: 0 } },
            {
                $addFields: {
                    userNumber: {
                        $toInt: {
                            $arrayElemAt: [{ $split: ['$userName', '-'] }, 1],
                        },
                    },
                },
            },
            {
                $lookup: {
                    from: 'bills',
                    localField: '_id',
                    foreignField: 'studentId',
                    as: 'bills',
                    pipeline: [
                        {
                            $project: {
                                amount: 1,
                                paid: 1,
                                paidOn: 1,
                                month: 1,
                                year: 1,
                            },
                        },
                        { $sort: { createdAt: -1 } },
                    ],
                },
            },
        ],
        {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { userNumber: 1 },
        },
        project
    );

    if (result.docs.length) {
        const data = {
            students: result.docs,
            studentsInfo: {
                hasNextPage: result.hasNextPage,
                hasPrevPage: result.hasPrevPage,
                totalCount: result.totalDocs,
            },
        };
        return res.status(OK).json(data);
    } else {
        return res.status(OK).json({ message: 'no students found' });
    }
});

export const registerStudent = tryCatch(
    'register student',
    async (req, res) => {
        const contractor = req.user; // only contractor can register a student
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

        // send this password on student's email
        await sendMail({
            receiverName: student.fullName,
            receiverMail: student.email,
            subject: 'Welcome to SnackTrack',
            html: `Hello ${student.fullName}, <br> Your temporary password is <b>${randomPassword}</b> <br> You can update it anytime from settings.`,
        });

        const { password: _, refreshToken: __, ...rest } = student.toObject();

        return res.status(CREATED).json(rest);
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

                // only push valid rows
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

            // Prepare duplicates check
            const emails = [],
                phoneNumbers = [],
                userNames = [];
            rows.map((u) => {
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

            const userDocs = [];
            for (let i = 0; i < rows.length; i++) {
                const u = rows[i];
                const email = u.email.toLowerCase().trim();
                const phone = u.phoneNumber.trim();
                const userName = userNames[i];

                if (
                    !existingSet.has(email) &&
                    !existingSet.has(userName) &&
                    !existingSet.has(phone)
                ) {
                    userDocs.push({
                        fullName: u.fullName,
                        canteenId: contractor.canteenId,
                        userName,
                        phoneNumber: phone,
                        email,
                        password: nanoid(8),
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

            // --- Generate QR Codes ---
            const tempDir = path.join(process.cwd(), 'public', 'temp');
            const qrDir = path.join(tempDir, `qrs-${Date.now()}`);
            fs.mkdirSync(qrDir, { recursive: true });

            // Process QR codes in batches to avoid memory issues
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

            // --- Create ZIP ---
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

            // --- Send ZIP for download ---
            res.download(zipPath, zipFileName, (err) => {
                // Cleanup after download completes or fails
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

// export const registerBulkStudents = tryCatch(
//     'bulk registration',
//     async (req, res) => {
//         const contractor = req.user;
//         const { hostelNumber, hostelType } = req.body;

//         const file = req.file?.path;
//         if (!file) {
//             throw new ErrorHandler('No Excel file uploaded', BAD_REQUEST);
//         }

//         // --- Read Excel file ---
//         const workbook = new ExcelJS.Workbook();
//         await workbook.xlsx.readFile(file);
//         const worksheet = workbook.worksheets[0];

//         const headers = worksheet.getRow(1).values;
//         const rows = [];

//         worksheet.eachRow((row, rowNumber) => {
//             if (rowNumber === 1) return;
//             const rowData = {};
//             headers.forEach((header, index) => {
//                 if (header && row.getCell(index).value != null) {
//                     const value =
//                         row.getCell(index).text?.trim() ||
//                         String(row.getCell(index).value).trim();
//                     rowData[header] = value;
//                 }
//             });
//             rows.push(rowData);
//         });

//         const validUsers = rows.filter(
//             (r) => r.fullName && r.rollNo && r.phoneNumber && r.email
//         );

//         if (!validUsers.length) {
//             fs.unlinkSync(file);
//             throw new ErrorHandler(
//                 'Invalid format. Ensure columns are: fullName, rollNo, email, phoneNumber',
//                 BAD_REQUEST
//             );
//         }

//         // Prepare duplicates check
//         const [emails, phoneNumbers, userNames] = [[], [], []];
//         validUsers.map((u) => {
//             emails.push(String(u.email).toLowerCase().trim());
//             phoneNumbers.push(String(u.phoneNumber).trim());
//             userNames.push(`${hostelType}${hostelNumber}-${u.rollNo}`.trim());
//         });

//         const existing = await Student.find({
//             $or: [
//                 { email: { $in: emails } },
//                 { userName: { $in: userNames } },
//                 { phoneNumber: { $in: phoneNumbers } },
//             ],
//         }).select('email userName phoneNumber');

//         const existingSet = new Set(
//             existing.flatMap((u) => [u.email, u.userName, u.phoneNumber])
//         );

//         const newUsers = validUsers.filter((u) => {
//             const userName = `${hostelType}${hostelNumber}-${u.rollNo}`;
//             return (
//                 !existingSet.has(String(u.email).toLowerCase().trim()) &&
//                 !existingSet.has(userName.trim()) &&
//                 !existingSet.has(String(u.phoneNumber).trim())
//             );
//         });

//         if (!newUsers.length) {
//             fs.unlinkSync(file);
//             throw new ErrorHandler('No new registrations found', BAD_REQUEST);
//         }

//         // Create student docs
//         const userDocs = newUsers.map((u) => ({
//             fullName: u.fullName,
//             canteenId: contractor.canteenId,
//             userName: `${hostelType}${hostelNumber}-${u.rollNo}`,
//             phoneNumber: u.phoneNumber,
//             email: u.email,
//             password: nanoid(8),
//         }));

//         // --- Insert into DB ---
//         let inserted = [];
//         try {
//             inserted = await Student.insertMany(userDocs, { ordered: false });
//         } catch (err) {
//             console.error('InsertMany failed:', err);
//             throw new ErrorHandler('Error inserting new students', 500);
//         }

//         console.log(`Inserted ${inserted.length} students successfully`);

//         // --- Generate QR Codes ---
//         const tempDir = path.join(process.cwd(), 'public', 'temp');
//         const qrDir = path.join(tempDir, `qrs-${Date.now()}`);
//         fs.mkdirSync(qrDir, { recursive: true });

//         for (const student of inserted) {
//             const qrDataURL = await genQR({
//                 _id: student._id,
//                 passHash: student.password,
//             });

//             const base64Data = qrDataURL.replace(
//                 /^data:image\/png;base64,/,
//                 ''
//             );
//             const fileName = `${getRollNo(student.userName)}.png`; // use rollNo if available
//             const qrFilePath = path.join(qrDir, fileName);
//             fs.writeFileSync(qrFilePath, base64Data, 'base64');
//         }

//         const hostelName = newUsers[0].hostelType || 'Hostel';
//         const dateStr = new Date().toISOString().split('T')[0];
//         const zipFileName = `${hostelName}-${dateStr}.zip`;
//         const zipPath = path.join(tempDir, zipFileName);

//         // --- Create ZIP ---
//         await new Promise((resolve, reject) => {
//             const output = fs.createWriteStream(zipPath);
//             const archive = archiver('zip', { zlib: { level: 9 } });

//             output.on('close', resolve);
//             archive.on('error', reject);

//             archive.pipe(output);
//             archive.directory(qrDir, false);
//             archive.finalize();
//         });

//         console.log('ZIP created:', zipFileName);

//         fs.unlinkSync(file);

//         // --- Send ZIP for download ---

//         const fileStream = fs.createReadStream(zipPath);
//         fileStream.pipe(res);

//         fileStream.on('close', () => {
//             fs.rmSync(qrDir, { recursive: true, force: true });
//             fs.unlinkSync(zipPath);
//         });
//     }
// );

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

        const isPassValid = bcrypt.compareSync(password, contractor.password);
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

// snack management

export const addSnack = tryCatch('add snack', async (req, res) => {
    let imageURL;
    try {
        const contractor = req.user;
        const { name, price } = req.body;
        let image = req.file?.path || '';

        if (!name || !price) {
            if (image) fs.unlinkSync(image);
            throw new ErrorHandler('missing fields', BAD_REQUEST);
        }

        const alreadyExists = await Snack.findOne({
            // case insensitive
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            canteenId: new Types.ObjectId(contractor.canteenId),
        });
        if (alreadyExists) {
            if (image) fs.unlinkSync(image);
            throw new ErrorHandler('snack already exists', BAD_REQUEST);
        }

        // upload image on cloudinary if have any
        if (image) {
            image = (await uploadOnCloudinary(image))?.secure_url;
            imageURL = image;
        }

        const snack = await Snack.create({
            canteenId: contractor.canteenId,
            name,
            price,
            image,
        });

        io.emit('snackAdded', snack);

        return res.status(CREATED).json(snack);
    } catch (err) {
        if (imageURL) await deleteFromCloudinary(imageURL);
        throw err;
    }
});

export const deleteSnack = tryCatch('delete post', async (req, res) => {
    const { snackId } = req.params;
    const contractor = req.user;

    // to delete a snack that should belong to the contractor's canteen
    const snack = await Snack.findOneAndDelete({
        _id: new Types.ObjectId(snackId),
        canteenId: new Types.ObjectId(contractor.canteenId),
    });

    if (!snack) throw new ErrorHandler('snack not found', NOT_FOUND);
    if (snack.image) await deleteFromCloudinary(snack.image);

    io.emit('snackDeleted', { snackId: snack._id, canteenId: snack.canteenId });

    return res.status(OK).json({ message: 'snack deleted successfully' });
});

export const updateSnack = tryCatch('update snack', async (req, res) => {
    let imageURL;
    try {
        const { snackId } = req.params;
        const contractor = req.user;
        const { name, price } = req.body;
        let image = req.file?.path;

        if (!name && !price && !image) {
            throw new ErrorHandler('missing fields', BAD_REQUEST);
        }

        const snack = await Snack.findOne({
            _id: new Types.ObjectId(snackId),
            canteenId: new Types.ObjectId(contractor.canteenId),
        });
        if (!snack) {
            if (image) fs.unlinkSync(image);
            throw new ErrorHandler('snack not found', NOT_FOUND);
        }

        if (snack.name.toLowerCase().trim() !== name.toLowerCase().trim()) {
            // if name is being changed, check for duplicates
            const existingSnack = await Snack.findOne({
                name: { $regex: new RegExp(`^${name}$`, 'i') },
                canteenId: new Types.ObjectId(contractor.canteenId),
            });

            if (existingSnack) {
                if (image) fs.unlinkSync(image);
                throw new ErrorHandler('snack already exists', BAD_REQUEST);
            }
        }

        if (image) {
            imageURL = (await uploadOnCloudinary(image))?.secure_url;
        }

        snack.image = imageURL || snack.image;
        snack.name = name.trim() || snack.name;
        snack.price = price || snack.price;
        await snack.save();

        io.emit('snackUpdated', {
            _id: snack._id,
            canteenId: snack.canteenId,
            name: snack.name,
            price: snack.price,
            image: snack.image,
        });

        return res.status(OK).json(snack);
    } catch (err) {
        if (imageURL) await deleteFromCloudinary(imageURL);
        throw err;
    }
});

export const toggleSnackAvailability = tryCatch(
    'toggle snack availability',
    async (req, res) => {
        const { snackId } = req.params;
        const contractor = req.user;

        // a contractor can update the snack details only if the snack belongs to his canteen
        const snack = await Snack.findOne({
            _id: new Types.ObjectId(snackId),
            canteenId: new Types.ObjectId(contractor.canteenId),
        });
        if (!snack) throw new ErrorHandler('snack not found', NOT_FOUND);

        snack.isAvailable = !snack.isAvailable;
        await snack.save();

        io.emit('snackUpdated', {
            _id: snack._id,
            canteenId: snack.canteenId,
            isAvailable: snack.isAvailable,
        });

        return res
            .status(OK)
            .json({ message: 'snack availability toggled successfully' });
    }
);

// packaged food management

export const addItem = tryCatch('add item', async (req, res) => {
    const contractor = req.user;
    const { name, price } = req.body;

    if (!name || !price) {
        throw new ErrorHandler('missing fields', BAD_REQUEST);
    }

    const alreadyExists = await PackagedFood.findOne({
        canteenId: new Types.ObjectId(contractor.canteenId),
        name: { $regex: new RegExp(`^${name}$`, 'i') },
    });
    if (alreadyExists) {
        throw new ErrorHandler('name already exists', BAD_REQUEST);
    }

    const item = await PackagedFood.create({
        canteenId: contractor.canteenId,
        name,
        price,
    });

    io.emit('itemAdded', item);

    return res.status(CREATED).json(item);
});

export const deleteItem = tryCatch('delete item', async (req, res) => {
    const { itemId } = req.params;
    const contractor = req.user;

    // Find the item and ensure it belongs to the contractor's canteen
    const item = await PackagedFood.findOneAndDelete({
        _id: new Types.ObjectId(itemId),
        canteenId: new Types.ObjectId(contractor.canteenId),
    });
    if (!item) {
        throw new ErrorHandler('item not found', NOT_FOUND);
    }

    io.emit('itemDeleted', { itemId: item._id, canteenId: item.canteenId });

    return res.status(OK).json({ message: 'item deleted successfully' });
});

export const updateItem = tryCatch('update item', async (req, res) => {
    const { itemId } = req.params;
    const contractor = req.user;
    const { name, price } = req.body;

    if (!name && !price) {
        throw new ErrorHandler('missing fields', BAD_REQUEST);
    }

    const item = await PackagedFood.findOne({
        _id: new Types.ObjectId(itemId),
        canteenId: new Types.ObjectId(contractor.canteenId),
    });

    if (!item) {
        throw new ErrorHandler('item not found', NOT_FOUND);
    }

    if (item.name.toLowerCase().trim() !== name.toLowerCase().trim()) {
        // if name is being changed, check for duplicates
        const existingItem = await PackagedFood.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            canteenId: new Types.ObjectId(contractor.canteenId),
        });

        if (existingItem) {
            throw new ErrorHandler('item already exists', BAD_REQUEST);
        }
    }

    item.name = name.trim() || item.name;
    item.price = price || item.price;
    await item.save();

    io.emit('itemUpdated', {
        _id: item._id,
        canteenId: item.canteenId,
        name: item.name,
        price: item.price,
    });

    return res.status(OK).json(item);
});

export const toggleItemAvailability = tryCatch(
    'toggle item availability',
    async (req, res, next) => {
        const { itemId } = req.params;
        const contractor = req.user;

        const item = await PackagedFood.findOne({
            _id: new Types.ObjectId(itemId),
            canteenId: new Types.ObjectId(contractor.canteenId),
        });
        if (!item) throw new ErrorHandler('item not found', NOT_FOUND);

        item.isAvailable = !item.isAvailable;
        await item.save();

        io.emit('itemUpdated', {
            _id: item._id,
            canteenId: item.canteenId,
            isAvailable: item.isAvailable,
        });

        return res
            .status(OK)
            .json({ message: 'item availability toggled successfully' });
    }
);

import { OK, BAD_REQUEST, NOT_FOUND, CREATED } from '../Constants/index.js';
import bcrypt from 'bcryptjs';
import {
    verifyExpression,
    tryCatch,
    ErrorHandler,
    sendMail,
} from '../Utils/index.js';
import { uploadOnCloudinary, deleteFromCloudinary } from '../Helpers/index.js';
import { nanoid } from 'nanoid';
import { Snack, Student, PackagedFood, Order, Bill } from '../Models/index.js';
import { Types } from 'mongoose';
import fs from 'fs';
import { io } from '../socket.js';

// student management

const getStudents = tryCatch('get students', async (req, res) => {
    const { limit = 10, page = 1, search = '' } = req.query;
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
        }
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

const registerStudent = tryCatch(
    'register as student',
    async (req, res, next) => {
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
            return next(new ErrorHandler('Missing fields', BAD_REQUEST));
        }

        const isValid = ['fullName', 'email', 'phoneNumber', 'rollNo'].every(
            (key) => verifyExpression(key, req.body[key]?.trim())
        );
        if (!isValid) {
            return next(new ErrorHandler('Invalid input data', BAD_REQUEST));
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
            return next(new ErrorHandler('user already exists', BAD_REQUEST));
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

        return res.status(CREATED).json(student);
    }
);

const removeStudent = tryCatch(
    'remove student account',
    async (req, res, next) => {
        const { studentId } = req.params;
        const contractor = req.user;

        // check if bills are pending
        const pendingBill = await Bill.findOne({
            studentId: new Types.ObjectId(studentId),
            paid: false,
        });

        if (pendingBill) {
            return next(
                new ErrorHandler('student has pending bills', BAD_REQUEST)
            );
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
            return next(new ErrorHandler('student not found', NOT_FOUND));
        }

        return res.status(OK).json({ message: 'account deleted successfully' });
    }
);

const updateStudent = tryCatch(
    'update account details',
    async (req, res, next) => {
        const contractor = req.user;
        const { studentId } = req.params;
        const {
            fullName,
            phoneNumber,
            email,
            rollNo,
            hostelNumber,
            hostelType,
        } = req.body;

        const student = await Student.findOne({
            _id: new Types.ObjectId(studentId),
            canteenId: new Types.ObjectId(contractor.canteenId),
        });

        if (!student) {
            return next(new ErrorHandler('student not found', NOT_FOUND));
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
            return next(new ErrorHandler('user already exists', BAD_REQUEST));
        }

        const updatedStudent = await Student.findByIdAndUpdate(studentId, {
            $set: {
                userName: newUserName,
                phoneNumber,
                fullName,
                email,
            },
        });

        return res.status(OK).json(updatedStudent);
    }
);

// ! CRITICAL
const removeAllStudents = tryCatch(
    'remove all students',
    async (req, res, next) => {
        const { password } = req.body;
        const contractor = req.user;
        if (!password) {
            return next(new ErrorHandler('missing fields', BAD_REQUEST));
        }

        const isPassValid = bcrypt.compareSync(password, contractor.password);
        if (!isPassValid) {
            return next(new ErrorHandler('invalid credentials', BAD_REQUEST));
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

const addSnack = tryCatch('add snack', async (req, res, next) => {
    let imageURL;
    try {
        const contractor = req.user;
        const { name, price } = req.body;
        let image = req.file?.path || '';

        if (!name || !price) {
            if (image) fs.unlinkSync(image);
            return next(new ErrorHandler('missing fields', BAD_REQUEST));
        }

        const alreadyExists = await Snack.findOne({
            // case insensitive
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            canteenId: new Types.ObjectId(contractor.canteenId),
        });
        if (alreadyExists) {
            if (image) fs.unlinkSync(image);
            return next(new ErrorHandler('snack already exists', BAD_REQUEST));
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

const deleteSnack = tryCatch('delete post', async (req, res, next) => {
    const { snackId } = req.params;
    const contractor = req.user;

    // to delete a snack that should belong to the contractor's canteen
    const snack = await Snack.findOneAndDelete({
        _id: new Types.ObjectId(snackId),
        canteenId: new Types.ObjectId(contractor.canteenId),
    });

    if (!snack) return next(new ErrorHandler('snack not found', NOT_FOUND));
    if (snack.image) await deleteFromCloudinary(snack.image);

    io.emit('snackDeleted', { snackId: snack._id, canteenId: snack.canteenId });

    return res.status(OK).json({ message: 'snack deleted successfully' });
});

const updateSnack = tryCatch('update snack', async (req, res, next) => {
    let imageURL;
    try {
        const { snackId } = req.params;
        const contractor = req.user;
        const { name, price } = req.body;
        let image = req.file?.path;

        if (!name && !price && !image) {
            return next(new ErrorHandler('missing fields', BAD_REQUEST));
        }

        const snack = await Snack.findOne({
            _id: new Types.ObjectId(snackId),
            canteenId: new Types.ObjectId(contractor.canteenId),
        });
        if (!snack) {
            if (image) fs.unlinkSync(image);
            return next(new ErrorHandler('snack not found', NOT_FOUND));
        }

        if (snack.name.toLowerCase().trim() !== name.toLowerCase().trim()) {
            // if name is being changed, check for duplicates
            const existingSnack = await Snack.findOne({
                name: { $regex: new RegExp(`^${name}$`, 'i') },
                canteenId: new Types.ObjectId(contractor.canteenId),
            });

            if (existingSnack) {
                if (image) fs.unlinkSync(image);
                return next(
                    new ErrorHandler('snack already exists', BAD_REQUEST)
                );
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

const toggleSnackAvailability = tryCatch(
    'toggle snack availability',
    async (req, res, next) => {
        const { snackId } = req.params;
        const contractor = req.user;

        // a contractor can update the snack details only if the snack belongs to his canteen
        const snack = await Snack.findOne({
            _id: new Types.ObjectId(snackId),
            canteenId: new Types.ObjectId(contractor.canteenId),
        });
        if (!snack) return next(new ErrorHandler('snack not found', NOT_FOUND));

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

const addItem = tryCatch('add item', async (req, res, next) => {
    const contractor = req.user;
    const { name, price } = req.body;

    if (!name || !price) {
        return next(new ErrorHandler('missing fields', BAD_REQUEST));
    }

    const alreadyExists = await PackagedFood.findOne({
        canteenId: new Types.ObjectId(contractor.canteenId),
        name: { $regex: new RegExp(`^${name}$`, 'i') },
    });
    if (alreadyExists) {
        return next(new ErrorHandler('name already exists', BAD_REQUEST));
    }

    const item = await PackagedFood.create({
        canteenId: contractor.canteenId,
        name,
        price,
    });

    io.emit('itemAdded', item);

    return res.status(CREATED).json(item);
});

const deleteItem = tryCatch('delete item', async (req, res, next) => {
    const { itemId } = req.params;
    const contractor = req.user;

    // Find the item and ensure it belongs to the contractor's canteen
    const item = await PackagedFood.findOneAndDelete({
        _id: new Types.ObjectId(itemId),
        canteenId: new Types.ObjectId(contractor.canteenId),
    });
    if (!item) {
        return next(new ErrorHandler('item not found', NOT_FOUND));
    }

    io.emit('itemDeleted', { itemId: item._id, canteenId: item.canteenId });

    return res.status(OK).json({ message: 'item deleted successfully' });
});

const updateItem = tryCatch('update item', async (req, res, next) => {
    const { itemId } = req.params;
    const contractor = req.user;
    const { name, price } = req.body;

    if (!name && !price) {
        return next(new ErrorHandler('missing fields', BAD_REQUEST));
    }

    const item = await PackagedFood.findOne({
        _id: new Types.ObjectId(itemId),
        canteenId: new Types.ObjectId(contractor.canteenId),
    });

    if (!item) {
        return next(new ErrorHandler('item not found', NOT_FOUND));
    }

    if (item.name.toLowerCase().trim() !== name.toLowerCase().trim()) {
        // if name is being changed, check for duplicates
        const existingItem = await PackagedFood.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            canteenId: new Types.ObjectId(contractor.canteenId),
        });

        if (existingItem) {
            return next(new ErrorHandler('item already exists', BAD_REQUEST));
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

const toggleItemAvailability = tryCatch(
    'toggle item availability',
    async (req, res, next) => {
        const { itemId } = req.params;
        const contractor = req.user;

        const item = await PackagedFood.findOne({
            _id: new Types.ObjectId(itemId),
            canteenId: new Types.ObjectId(contractor.canteenId),
        });
        if (!item) return next(new ErrorHandler('item not found', NOT_FOUND));

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

export {
    getStudents,
    registerStudent,
    removeAllStudents,
    removeStudent,
    updateStudent,
    addSnack,
    deleteSnack,
    updateSnack,
    toggleSnackAvailability,
    addItem,
    deleteItem,
    updateItem,
    toggleItemAvailability,
};

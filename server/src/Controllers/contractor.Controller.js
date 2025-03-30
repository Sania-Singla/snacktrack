import {
    OK,
    BAD_REQUEST,
    NOT_FOUND,
    CREATED,
    USER_PLACEHOLDER_IMAGE_URL,
    SNACK_PLACEHOLDER_IMAGE_URL,
} from '../Constants/index.js';
import bcrypt from 'bcrypt';
import {
    verifyExpression,
    tryCatch,
    ErrorHandler,
    sendVerificationEmail,
    verifyEmail,
} from '../Utils/index.js';
import { uploadOnCloudinary, deleteFromCloudinary } from '../Helpers/index.js';
import { nanoid } from 'nanoid';
import {
    Canteen,
    Contractor,
    Snack,
    Student,
    PackagedFood,
    Order,
} from '../Models/index.js';
import { Types } from 'mongoose';
import fs from 'fs';
import { sendMail } from '../mailer.js';

// personal usage

const register = tryCatch('register as contractor', async (req, res, next) => {
    const { fullName, email, phoneNumber, password, hostel, kitchenKey } =
        req.body;

    if (
        !fullName ||
        !email ||
        !phoneNumber ||
        !password ||
        !hostel ||
        !kitchenKey
    ) {
        return next(new ErrorHandler('Missing fields', BAD_REQUEST));
    }

    const isValid = [
        'fullName',
        'email',
        'phoneNumber',
        'password',
        'kitchenKey',
    ].every((key) => verifyExpression(key, req.body[key]?.trim()));

    if (!isValid) {
        return next(new ErrorHandler('Invalid input data', BAD_REQUEST));
    }

    // single canteen -> single contractor & single contractor -> single canteen
    const [existingCanteen, existingContractor] = await Promise.all([
        Canteen.findOne({
            $or: [
                { hostelName: hostel.hostelName.trim() },
                {
                    $and: [
                        { hostelNumber: hostel.hostelNumber.trim() },
                        { hostelType: hostel.hostelType.trim() },
                    ],
                },
            ],
        }),
        Contractor.findOne({
            $or: [{ email: email.trim() }, { phoneNumber: phoneNumber.trim() }],
        }),
    ]);

    if (existingCanteen) {
        return next(new ErrorHandler('canteen already exists', NOT_FOUND));
    }

    if (existingContractor) {
        return next(new ErrorHandler('contractor already exists', BAD_REQUEST));
    }

    // Send email verification
    await sendVerificationEmail(email.trim());

    return res.status(OK).json({ message: 'Verification code sent' });
});

const completeRegistration = tryCatch(
    'complete contractor registration',
    async (req, res, next) => {
        const {
            email,
            code,
            fullName,
            phoneNumber,
            password,
            hostel,
            kitchenKey,
        } = req.body;

        if (
            !email ||
            !code ||
            !fullName ||
            !phoneNumber ||
            !password ||
            !hostel ||
            !kitchenKey
        ) {
            return next(new ErrorHandler('Missing fields', BAD_REQUEST));
        }

        // Verify code
        const isValid = await verifyEmail(email, code);
        if (!isValid) {
            return next(
                new ErrorHandler('Invalid verification code', BAD_REQUEST)
            );
        }

        // Now register the contractor & canteen
        const canteen = await Canteen.create({
            hostelName: hostel.hostelName.trim(),
            hostelNumber: hostel.hostelNumber.trim(),
            hostelType: hostel.hostelType.trim(),
            kitchenKey,
        });

        // password hashing auto done by pre hook in the model
        const contractor = await Contractor.create({
            fullName,
            email,
            phoneNumber,
            password,
            avatar: USER_PLACEHOLDER_IMAGE_URL,
            canteenId: canteen._id,
        });

        // Link contractor to canteen
        canteen.contractorId = contractor._id;
        await canteen.save();

        return res.status(CREATED).json(contractor);
    }
);

const updateAccountDetails = tryCatch(
    'update account details',
    async (req, res, next) => {
        const { _id, password } = req.user;
        const data = {
            fullName: req.body.fullName.trim(),
            email: req.body.email.trim(),
            phoneNumber: req.body.phoneNumber,
            password: req.body.password,
        };

        // input error handling
        if (!data.fullName || !data.email || !data.phoneNumber) {
            return next(new ErrorHandler('missing fields', BAD_REQUEST));
        }
        for (const [key, value] of Object.entries(data)) {
            if (value && key !== 'password') {
                const isValid = verifyExpression(key, value);
                if (!isValid) {
                    return next(
                        new ErrorHandler(`${key} is invalid.`, BAD_REQUEST)
                    );
                }
            }
        }

        const isPassValid = bcrypt.compareSync(data.password, password);
        if (!isPassValid) {
            return next(new ErrorHandler('invalid credentials', BAD_REQUEST));
        }

        // update or keep prev details if empty
        await Contractor.findByIdAndUpdate(
            _id,
            {
                $set: {
                    ...(data.email && { email: data.email }),
                    ...(data.phoneNumber && { phoneNumber: data.phoneNumber }),
                    ...(data.fullName && { fullName: data.fullName }),
                },
            },
            { new: true }
        );

        return res
            .status(OK)
            .json({ message: 'account details updated successfully' });
    }
);

// student management tasks

const getStudents = tryCatch('get students', async (req, res) => {
    const { limit = 10, page = 1 } = req.query; // for pagination
    const result = await Student.aggregatePaginate(
        [
            { $match: { canteenId: new Types.ObjectId(req.user.canteenId) } },
            { $project: { password: 0, refreshToken: 0 } },
        ],
        {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createdAt: -1 },
        }
    );

    if (result.docs.length) {
        const data = {
            students: result.docs,
            studentsInfo: {
                hasNextPage: result.hasNextPage,
                hasPrevPage: result.hasPrevPage,
                totalStudents: result.totalDocs,
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
        const { fullName, rollNo, phoneNumber, email, password } = req.body;

        if (!fullName || !email || !phoneNumber || !password || !rollNo) {
            return next(new ErrorHandler('Missing fields', BAD_REQUEST));
        }

        const isValid = ['fullName', 'email', 'phoneNumber', 'rollNo'].every(
            (key) => verifyExpression(key, req.body[key]?.trim())
        );

        if (!isValid) {
            return next(new ErrorHandler('Invalid input data', BAD_REQUEST));
        }

        const isPassValid = bcrypt.compareSync(password, contractor.password);
        if (!isPassValid) {
            return next(new ErrorHandler('invalid credentials', BAD_REQUEST));
        }

        const canteen = await Canteen.findById(contractor.canteenId);
        if (!canteen) {
            return next(new ErrorHandler('Canteen not found', NOT_FOUND));
        }

        const userName = (
            canteen.hostelType +
            canteen.hostelNumber +
            '-' +
            rollNo
        ).trim();

        // Check if student already exists with this userName
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

        // password hashing auto done by pre hook in the model
        const randomPassword = nanoid(8); // unique temporary random password

        const student = await Student.create({
            fullName,
            canteenId: contractor.canteenId,
            userName,
            phoneNumber,
            email,
            password: randomPassword,
            avatar: USER_PLACEHOLDER_IMAGE_URL,
        });

        // send this password on student's email
        await sendMail({
            to: data.email,
            subject: 'Welcome to SnackTrack',
            html: `Hello ${data.fullName}, <br> Your temporary password is ${randomPassword}, You can update it anytime after logging in from settings.`,
        });

        return res.status(CREATED).json(student);
    }
);

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
        ]);
        return res
            .status(OK)
            .json({ message: 'all students removed successfully' });
    }
);

const removeStudent = tryCatch(
    'remove student account',
    async (req, res, next) => {
        const { studentId } = req.params;
        const contractor = req.user;
        const { password } = req.body;

        const isPassValid = bcrypt.compareSync(password, contractor.password);
        if (!isPassValid) {
            return next(new ErrorHandler('invalid credentials', BAD_REQUEST));
        }

        // a contractor can remove the student only if the student belongs to his canteen
        const student = await Promise.all([
            Student.findOneAndDelete({
                _id: new Types.ObjectId(studentId),
                canteenId: new Types.ObjectId(contractor.canteenId),
            }),
            Order.deleteMany({
                studentId: new Types.ObjectId(studentId),
            }),
        ]);
        if (!student) {
            return next(new ErrorHandler('student not found', NOT_FOUND));
        }

        if (student.avatar !== USER_PLACEHOLDER_IMAGE_URL) {
            await deleteFromCloudinary(student.avatar);
        }

        return res.status(OK).json({ message: 'account deleted successfully' });
    }
);

// if two students are exchanging there roll no due to some reason then will have to delete one and update details of there and register first one again
const updateStudentAccountDetails = tryCatch(
    'update account details',
    async (req, res, next) => {
        const contractor = req.user;
        const { studentId } = req.params;
        const {
            fullName,
            phoneNumber,
            email,
            rollNo,
            password,
            contractorPassword,
        } = req.body;

        const [student] = await Student.aggregate([
            {
                $match: {
                    _id: new Types.ObjectId(studentId),
                    canteenId: new Types.ObjectId(contractor.canteenId),
                },
            },
            {
                $lookup: {
                    from: 'canteens',
                    localField: 'canteenId',
                    foreignField: '_id',
                    as: 'canteen',
                },
            },
            { $unwind: '$canteen' },
        ]);

        if (!student) {
            return next(new ErrorHandler('student not found', NOT_FOUND));
        }

        const [isStudentPassValid, isContractorPassValid] = await Promise.all([
            bcrypt.compare(password, student.password),
            bcrypt.compare(contractorPassword, contractor.password),
        ]);
        if (!isStudentPassValid) {
            return next(
                new ErrorHandler('invalid student password', BAD_REQUEST)
            );
        }
        if (!isContractorPassValid) {
            return next(new ErrorHandler('invalid credentials', BAD_REQUEST));
        }

        let alreadyExists = null;
        const newUserName =
            student.canteen.hostelType +
            student.canteen.hostelNumber +
            '-' +
            rollNo;

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
                ...(rollNo && {
                    userName:
                        student.canteen.hostelType +
                        student.canteen.hostelNumber +
                        '-' +
                        rollNo,
                }),
                ...(phoneNumber && { phoneNumber }),
                ...(fullName && { fullName }),
                ...(email && { email }),
            },
        });

        return res.status(OK).json(updatedStudent);
    }
);

// snack management tasks

const addSnack = tryCatch('add snack', async (req, res, next) => {
    let imageURL;
    try {
        const contractor = req.user;
        const { name, price, password } = req.body;
        let image = req.file?.path;

        if (!name || !price) {
            if (image) fs.unlinkSync(image);
            return next(new ErrorHandler('missing fields', BAD_REQUEST));
        }
        const isPassValid = bcrypt.compareSync(password, contractor.password);
        if (!isPassValid) {
            return next(new ErrorHandler('invalid credentials', BAD_REQUEST));
        }

        const alreadyExists = await Snack.findOne({
            // case insensitive
            name: { $regex: new RegExp(`^${name}$`, 'i') },
            canteenId: new Types.ObjectId(contractor.canteenId),
        });
        if (alreadyExists) {
            if (image) await deleteFromCloudinary(image);
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
            image: image || SNACK_PLACEHOLDER_IMAGE_URL,
        });
        return res.status(CREATED).json(snack);
    } catch (err) {
        if (imageURL) await deleteFromCloudinary(imageURL);
        throw err;
    }
});

const deleteSnack = tryCatch('delete post', async (req, res, next) => {
    const { snackId } = req.params;
    const contractor = req.user;
    const { password } = req.body;
    const isPassValid = bcrypt.compareSync(password, contractor.password);
    if (!isPassValid) {
        return next(new ErrorHandler('invalid credentials', BAD_REQUEST));
    }
    // to delete a snack that should belong to the contractor's canteen
    const snack = await Snack.findOneAndDelete({
        _id: new Types.ObjectId(snackId),
        canteenId: new Types.ObjectId(contractor.canteenId),
    });
    if (!snack) return next(new ErrorHandler('snack not found', NOT_FOUND));
    if (snack.image !== SNACK_PLACEHOLDER_IMAGE_URL) {
        await deleteFromCloudinary(snack.image);
    }
    return res.status(OK).json({ message: 'snack deleted successfully' });
});

const updateSnackDetails = tryCatch(
    'update snack details',
    async (req, res, next) => {
        let imageURL;
        try {
            const { snackId } = req.params;
            const contractor = req.user;
            const { name, price, password } = req.body;
            let image = req.file?.path;

            if (!name && !price && !image) {
                return next(new ErrorHandler('missing fields', BAD_REQUEST));
            }
            const isPassValid = bcrypt.compareSync(
                password,
                contractor.password
            );
            if (!isPassValid) {
                return next(
                    new ErrorHandler('invalid credentials', BAD_REQUEST)
                );
            }

            const snack = await Snack.findOne({
                _id: new Types.ObjectId(snackId),
                canteenId: new Types.ObjectId(contractor.canteenId),
            });
            if (!snack) {
                if (image) fs.unlinkSync(image);
                return next(new ErrorHandler('snack not found', NOT_FOUND));
            }

            if (snack.name.toLowerCase() !== name.toLowerCase()) {
                const alreadyExists = await Snack.findOne({
                    // case insensitive
                    name: { $regex: new RegExp(`^${name}$`, 'i') },
                });
                if (alreadyExists) {
                    return next(
                        new ErrorHandler('snack already exists', BAD_REQUEST)
                    );
                }
            }

            if (image) {
                imageURL = (await uploadOnCloudinary(image))?.secure_url;
            }
            snack.image = imageURL || snack.image;
            snack.name = name || snack.name;
            snack.price = price || snack.price;
            await snack.save();

            return res.status(OK).json(snack);
        } catch (err) {
            if (imageURL) await deleteFromCloudinary(imageURL);
            throw err;
        }
    }
);

const toggleSnackAvailability = tryCatch(
    'toggle snack availability',
    async (req, res) => {
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
        return res
            .status(OK)
            .json({ message: 'snack availability toggled successfully' });
    }
);

// packaged food management tasks

const addItem = tryCatch('add item', async (req, res, next) => {
    const contractor = req.user;
    const { category, variants, password } = req.body;

    // Validate required fields
    if (!category || !variants.length) {
        return next(new ErrorHandler('missing fields', BAD_REQUEST));
    }
    const isPassValid = bcrypt.compareSync(password, contractor.password);
    if (!isPassValid) {
        return next(new ErrorHandler('invalid credentials', BAD_REQUEST));
    }

    const alreadyExists = await PackagedFood.findOne({
        canteenId: new Types.ObjectId(contractor.canteenId),
        // case insensitive
        category: { $regex: new RegExp(`^${category}$`, 'i') },
    });
    if (alreadyExists) {
        return next(new ErrorHandler('category already exists', BAD_REQUEST));
    }

    // Create new packaged food item
    const item = await PackagedFood.create({
        canteenId: contractor.canteenId,
        category,
        variants,
    });

    return res.status(CREATED).json(item);
});

const deleteItem = tryCatch('delete item', async (req, res, next) => {
    const { itemId } = req.params;
    const contractor = req.user;
    const { password } = req.body;
    const isPassValid = bcrypt.compareSync(password, contractor.password);
    if (!isPassValid) {
        return next(new ErrorHandler('invalid credentials', BAD_REQUEST));
    }
    // Find the item and ensure it belongs to the contractor's canteen
    const item = await PackagedFood.findOneAndDelete({
        _id: new Types.ObjectId(itemId),
        canteenId: new Types.ObjectId(contractor.canteenId),
    });
    if (!item) {
        return next(new ErrorHandler('item not found', NOT_FOUND));
    }

    return res.status(OK).json({ message: 'item deleted successfully' });
});

const updateItemDetails = tryCatch(
    'update item details',
    async (req, res, next) => {
        const { itemId } = req.params;
        const contractor = req.user;
        const { category, variants, password } = req.body;

        // Validate required fields
        if (!category && !variants.length) {
            return next(new ErrorHandler('missing fields', BAD_REQUEST));
        }

        const isPassValid = bcrypt.compareSync(password, contractor.password);
        if (!isPassValid) {
            return next(new ErrorHandler('invalid credentials', BAD_REQUEST));
        }

        const item = await PackagedFood.findOne({
            _id: new Types.ObjectId(itemId),
            canteenId: new Types.ObjectId(contractor.canteenId),
        });
        if (!item) return next(new ErrorHandler('item not found', NOT_FOUND));

        if (item.category.toLowerCase() !== category.toLowerCase()) {
            const existingItem = await PackagedFood.findOne({
                canteenId: new Types.ObjectId(contractor.canteenId),
                // case insensitive
                category: { $regex: new RegExp(`^${category}$`, 'i') },
            });

            if (existingItem) {
                return next(
                    new ErrorHandler('category already exists', BAD_REQUEST)
                );
            }
        }
        item.category = category || item.category;
        item.variants = variants || item.variants;
        await item.save();
        return res.status(OK).json(item);
    }
);

export {
    register,
    completeRegistration,
    updateAccountDetails,
    getStudents,
    registerStudent,
    removeAllStudents,
    removeStudent,
    updateStudentAccountDetails,
    addSnack,
    deleteSnack,
    updateSnackDetails,
    toggleSnackAvailability,
    addItem,
    deleteItem,
    updateItemDetails,
};

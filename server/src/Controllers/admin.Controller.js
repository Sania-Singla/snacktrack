import {
    OK,
    BAD_REQUEST,
    NOT_FOUND,
    CREATED,
    USER_PLACEHOLDER_IMAGE_URL,
    FORBIDDEN,
    HOSTELS,
} from '../Constants/index.js';
import {
    verifyExpression,
    tryCatch,
    ErrorHandler,
    sendVerificationEmail,
    verifyEmail,
} from '../Utils/index.js';
import { Canteen, Contractor } from '../Models/index.js';
import { sendMail } from '../mailer.js';
import { nanoid } from 'nanoid';
import { Types } from 'mongoose';
import bcrypt from 'bcrypt';

const registerCanteen = tryCatch(
    'register as contractor',
    async (req, res, next) => {
        const { fullName, email, phoneNumber, hostel, kitchenKey } = req.body;

        if (!fullName || !email || !phoneNumber || !hostel || !kitchenKey) {
            return next(new ErrorHandler('Missing fields', BAD_REQUEST));
        }

        const isValid = ['fullName', 'email', 'phoneNumber'].every((key) =>
            verifyExpression(key, req.body[key]?.trim())
        );

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
                            { hostelNumber: hostel.hostelNumber },
                            { hostelType: hostel.hostelType.trim() },
                        ],
                    },
                ],
            }),
            Contractor.findOne({
                $or: [
                    { email: email.trim() },
                    { phoneNumber: phoneNumber.trim() },
                ],
            }),
        ]);

        if (existingCanteen) {
            return next(new ErrorHandler('canteen already exists', NOT_FOUND));
        }

        if (existingContractor) {
            return next(
                new ErrorHandler('contractor already exists', BAD_REQUEST)
            );
        }

        // Now register the contractor & canteen
        const canteen = await Canteen.create({
            hostelName: hostel.hostelName.trim(),
            hostelNumber: hostel.hostelNumber,
            hostelType: hostel.hostelType.trim(),
            kitchenKey,
        });

        const randomPassword = nanoid(8); // unique temporary random password

        // password hashing auto done by pre hook in the model
        const contractor = await Contractor.create({
            fullName,
            email,
            phoneNumber,
            password: randomPassword,
            avatar: USER_PLACEHOLDER_IMAGE_URL,
            canteenId: canteen._id,
        });

        // Link contractor to canteen
        canteen.contractorId = contractor._id;
        await canteen.save();

        // send this password on contractor's email
        await sendMail({
            receiverName: fullName,
            receiverMail: email,
            subject: 'Welcome to SnackTrack',
            html: `Hello ${fullName}, <br> Your password is <b>${randomPassword}</b> <br> You can update it anytime after logging in from settings.`,
        });

        return res.status(CREATED).json(contractor);
    }
);

const sendVerificationCode = tryCatch(
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

const verifyCode = tryCatch('verify email', async (req, res) => {
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

const updateContractor = tryCatch(
    'update contractor',
    async (req, res, next) => {
        const { contractorId } = req.params;
        const { fullName, phoneNumber, email, kitchenKey } = req.body;

        if (!fullName || !phoneNumber || !email) {
            return res.status(BAD_REQUEST).json({ message: 'Missing Fields' });
        }

        const [contractor] = await Contractor.aggregate([
            {
                $match: {
                    _id: new Types.ObjectId(contractorId),
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
            {
                $unwind: '$canteen',
            },
        ]);

        let alreadyExists = null;

        if (contractor.phoneNumber !== phoneNumber) {
            alreadyExists = await Contractor.findOne({ phoneNumber });
        } else if (contractor.email !== email.toLowerCase()) {
            alreadyExists = await Contractor.findOne({
                email: email.toLowerCase(),
            });
        }
        if (alreadyExists) {
            return next(
                new ErrorHandler('contractor already exists', BAD_REQUEST)
            );
        }
        let newKitchenKey = null;
        if (kitchenKey) {
            const oldKitchenKey = contractor.canteen.kitchenKey;
            newKitchenKey =
                new Types.ObjectId(contractor.canteenId) +
                '-' +
                kitchenKey.trim();
            const isKitchenKeySame = bcrypt.compareSync(
                newKitchenKey,
                oldKitchenKey
            );
            if (!isKitchenKeySame) {
                const canteen = await Canteen.findById(contractor.canteenId);
                canteen.kitchenKey = newKitchenKey;
                await canteen.save();
                await sendMail({
                    receiverName: fullName,
                    receiverMail: email,
                    subject: 'Welcome to SnackTrack',
                    html: `Hello ${fullName}, <br> Your Canteen's Kitchen key is reset by you. The new Kitchen Key is <b>${newKitchenKey}</b> <br> You can update it anytime after.`,
                });
            }
        }
        newKitchenKey = bcrypt.hashSync(newKitchenKey, 10);
        const updatedContractor = await Contractor.findByIdAndUpdate(
            contractorId,
            {
                $set: {
                    fullName,
                    phoneNumber,
                    email,
                },
            },
            { new: true }
        );
        return res.status(OK).json(updatedContractor);
    }
);

const chnageContractor = tryCatch('update contractor', async (req, res) => {
    const { contractorId } = req.params;
    const { resetAvatar } = req.query;
    const { fullName, phoneNumber, email, kitchenKey } = req.body;

    if (!fullName || !phoneNumber || !email || !kitchenKey) {
        return res.status(BAD_REQUEST).json({ message: 'Missing Fields' });
    }

    const contractor = await Contractor.findById(contractorId);

    const oldKitchenKey = contractor.kitchenKey;
    const canteenId = oldKitchenKey.split('-');
    const newKitchenKey = canteenId + '-' + kitchenKey.trim();

    let alreadyExists = null;

    if (contractor.phoneNumber !== phoneNumber) {
        alreadyExists = await Contractor.findOne({ phoneNumber });
    } else if (contractor.email !== email.toLowerCase()) {
        alreadyExists = await Contractor.findOne({
            email: email.toLowerCase(),
        });
    }
    if (alreadyExists) {
        return next(new ErrorHandler('contractor already exists', BAD_REQUEST));
    }

    const newContractor = Contractor.findbyIdAndUpdate(
        contractorId,
        {
            $set: {
                fullName,
                phoneNumber,
                email,
                kitchenKey: newKitchenKey,
                avatar: resetAvatar
                    ? USER_PLACEHOLDER_IMAGE_URL
                    : contractor.avatar,
            },
        },
        { new: true }
    );

    return res.status(OK).json(newContractor);
});

const getContractors = tryCatch('get contractors', async (req, res) => {
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
                            avatar: 1,
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

const getHostels = tryCatch('get hostels', async (req, res, next) => {
    return res.status(OK).json(HOSTELS);
});

export {
    registerCanteen,
    updateContractor,
    getContractors,
    getHostels,
    sendVerificationCode,
    verifyCode,
};

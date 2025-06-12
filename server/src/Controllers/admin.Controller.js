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

const registerCanteen = tryCatch(
    'register as contractor',
    async (req, res, next) => {
        const { fullName, email, phoneNumber, hostel } = req.body;

        if (!fullName || !email || !phoneNumber || !hostel) {
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

        const randomkitchenKey = nanoid(8); // unique temporary random kitchen key

        // Now register the contractor & canteen
        const canteen = await Canteen.create({
            hostelName: hostel.hostelName.trim(),
            hostelNumber: hostel.hostelNumber,
            hostelType: hostel.hostelType.trim(),
            kitchenKey: randomkitchenKey,
        });

        const randomPassword = nanoid(8); // unique temporary random password

        // password & kitchenKey hashing auto done by pre hooks
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

        // send this password & kitchenKey on contractor's email
        await sendMail({
            receiverName: fullName,
            receiverMail: email,
            subject: 'Welcome to SnackTrack',
            html: `
                Hello ${fullName}, <br>
                Welcome to SnackTrack! <br>
                You are now the manager of the canteen of Hostel: ${hostel.hostelType}${hostel.hostelNumber}-${hostel.hostelName}. <br>
                Your Temporary password is <b>${randomPassword}</b> <br>
                Your Temporary Kitchen Key is <b>${randomkitchenKey}</b> <br>
                <i>*These values can be updated anytime after logging in from settings.*</i> <br>
            `,
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

const updateContractor = tryCatch('update contractor', async (req, res) => {
    const { contractorId } = req.params;

    const { fullName, phoneNumber, email, kitchenKey } = req.body;

    if (!fullName || !phoneNumber || !email) {
        return res.status(BAD_REQUEST).json({ message: 'Missing Fields' });
    }

    const contractor = await Contractor.findById(contractorId);

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

    const updatedContractor = await Contractor.findByIdAndUpdate(
        contractorId,
        {
            $set: {
                fullName,
                phoneNumber,
                email,

                kitchenKey: newKitchenKey,

            },
        },
        { new: true }
    );

    return res.status(OK).json(updatedContractor);
});

// const chnageContractor = tryCatch('update contractor', async (req, res) => {
//     const { contractorId } = req.params;
//     const { resetAvatar } = req.query;
//     const { fullName, phoneNumber, email, kitchenKey } = req.body;

//     if (!fullName || !phoneNumber || !email || !kitchenKey) {
//         return res.status(BAD_REQUEST).json({ message: 'Missing Fields' });
//     }

//     const contractor = await Contractor.findById(contractorId);

//     const oldKitchenKey = contractor.kitchenKey;
//     const canteenId = oldKitchenKey.split('-');
//     const newKitchenKey = canteenId + '-' + kitchenKey.trim();

//     let alreadyExists = null;

//     if (contractor.phoneNumber !== phoneNumber) {
//         alreadyExists = await Contractor.findOne({ phoneNumber });
//     } else if (contractor.email !== email.toLowerCase()) {
//         alreadyExists = await Contractor.findOne({
//             email: email.toLowerCase(),
//         });
//     }
//     if (alreadyExists) {
//         return next(new ErrorHandler('contractor already exists', BAD_REQUEST));
//     }

//     const newContractor = Contractor.findbyIdAndUpdate(
//         contractorId,
//         {
//             $set: {
//                 fullName,
//                 phoneNumber,
//                 email,
//                 kitchenKey: newKitchenKey,
//                 avatar: resetAvatar
//                     ? USER_PLACEHOLDER_IMAGE_URL
//                     : contractor.avatar,
//             },
//         },
//         { new: true }
//     );

//     return res.status(OK).json(newContractor);
// });

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

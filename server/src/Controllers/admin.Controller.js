import {
    OK,
    BAD_REQUEST,
    NOT_FOUND,
    CREATED,
    USER_PLACEHOLDER_IMAGE_URL,
    FORBIDDEN,
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

const registerCanteen = tryCatch(
    'register as contractor',
    async (req, res, next) => {
        const { fullName, email, phoneNumber, hostel, kitchenKey } = req.body;

        if (!fullName || !email || !phoneNumber || !hostel || !kitchenKey) {
            return next(new ErrorHandler('Missing fields', BAD_REQUEST));
        }

        req.body.kitchenKey =
            hostel.hostelType + hostel.hostelNumber + kitchenKey.trim();

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

        // Send email verification
        await sendVerificationEmail(fullName, email.trim());

        return res.status(OK).json({ message: 'Verification code sent' });
    }
);

const completeRegistration = tryCatch(
    'complete contractor registration',
    async (req, res, next) => {
        const { email, code, fullName, phoneNumber, hostel, kitchenKey } =
            req.body;

        if (
            !email ||
            !code ||
            !fullName ||
            !phoneNumber ||
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

const verifyEmail = tryCatch('verify email', async (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) {
        return res.status(BAD_REQUEST).json({ message: 'Missing Fields' });
    }
    const isVerified = verifyEmail(email, code);
    if (!isVerified) {
        return res.status(FORBIDDEN).json('Please verify you email first.');
    }

    return res.status(OK).json({ message: 'Email verified Successfully' });
});

const resendVerificationCode = tryCatch(
    'resend verification code',
    async (req, res) => {
        const { email } = req.body;

        // Send email verification
        await sendVerificationEmail(email.trim());

        return res.status(OK).json({ message: 'Verification code resent' });
    }
);

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

const deleteCanteen = tryCatch('delete canteen', async (req, res) => {
    const { canteenId } = req.params;
    const deletedCanteen = await Canteen.findByIdAndDelete(canteenId);
    return res.status(OK).json(deletedCanteen);
});

const updateContractor = tryCatch('update contractor', async (req, res) => {
    const { contractorId, canteenId } = req.params;
    const { fullName, phoneNumber, email, kitchenKey } = req.body;
    if ((!fullName, !phoneNumber, !email, !kitchenKey)) {
        return res.status(BAD_REQUEST).json({ message: 'Missing Fields' });
    }

    const [canteen, contractor] = await Promise.all([
        Canteen.findById(canteenId),
        Contractor.findOne({
            $or: [{ email: email.trim() }, { phoneNumber: phoneNumber.trim() }],
        }),
    ]);

    if (!contractor) {
        return next(new ErrorHandler('contractor not found', BAD_REQUEST));
    }

    let newKitchenKey = null;
    if (contractor.kitchenKey !== kitchenKey) {
        newKitchenKey =
            canteen.hostelType + canteen.hostelNumber + kitchenKey.trim();
    }
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
    const newContractor = Canteen.findbyIdAndUpdate(
        { contractorId }, // admin can delete student of any canteenId!
        {
            $set: {
                fullName,
                phoneNumber,
                email,
                kitchenKey: newKitchenKey,
            },
        }
    );
    return res.status(OK).json(newContractor);
});

export {
    registerCanteen,
    completeRegistration,
    resendVerificationCode,
    deleteCanteen,
    updateContractor,
    getContractors,
    getHostels,
};

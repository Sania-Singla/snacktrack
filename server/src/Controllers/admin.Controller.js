import {
    OK,
    BAD_REQUEST,
    NOT_FOUND,
    CREATED,
    USER_PLACEHOLDER_IMAGE_URL,
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
    const hostels = await Canteen.distinct('hostelName');
    if (!hostels || hostels.length === 0) {
        return next(new ErrorHandler('No hostels found', NOT_FOUND));
    }
    return res.status(OK).json(hostels);
});

const deleteCanteen = tryCatch('delete canteen', async (req, res) => {
    const { canteenId } = req.params;
    const deletedCanteen = await Canteen.findByIdAndDelete({ _id: canteenId });
    return res.status(OK).json(deletedCanteen);
});

const updateContractor = tryCatch('update contractor', async (req, res) => {
    const { contractorId } = req.params;
    const { fullName, phoneNumber, email, kitchenKey } = req.body;
    const contractor = { fullName, phoneNumber, email, kitchenKey };
    if (Object.values(contractor).some(!value)) {
        return res.status(BAD_REQUEST).json({ message: 'Missing fields' });
    }
    const newContractor = Canteen.findbyIdAndUpdate(contractorId); // admin can delete student of any canteenId!
    return res.status(OK).json(newContractor);
});

export {
    registerCanteen,
    completeRegistration,
    resendVerificationCode,
    deleteCanteen,
    updateContractor,
    getContractors,
};

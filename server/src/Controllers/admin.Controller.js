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
} from '../Utils/index.js';
import { Canteen, Contractor } from '../Models/index.js';
import { nanoid } from 'nanoid';
import { generateAccessToken } from '../Helpers/tokens.js';
import bcrypt from 'bcryptjs';

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
        .populate('canteenId', 'hostelType hostelNumber hostelName')
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

export const updateContractor = tryCatch(
    'update contractor',
    async (req, res) => {
        const { contractorId } = req.params;
        let { fullName, phoneNumber, email, password } = req.body;
        fullName = fullName?.trim();
        email = email?.toLowerCase().trim();
        phoneNumber = phoneNumber?.trim();

        if (!fullName || !phoneNumber || !email || !password) {
            return res.status(BAD_REQUEST).json({ message: 'Missing Fields' });
        }

        const isValid = ['fullName', 'email', 'phoneNumber'].every((key) =>
            verifyExpression(key, req.body[key]?.trim())
        );

        if (!isValid) {
            throw new ErrorHandler('Invalid input data', BAD_REQUEST);
        }

        const contractor =
            await Contractor.findById(contractorId).select('-refeshToken');
        if (!contractor) {
            throw new ErrorHandler('contractor not found', NOT_FOUND);
        }

        const isPassCorrect = await bcrypt.compare(
            password,
            contractor.password
        );
        if (!isPassCorrect) {
            throw new ErrorHandler('Incorrect password', FORBIDDEN);
        }

        const alreadyExists = await Contractor.findOne({
            $or: [{ phoneNumber }, { email }],
            _id: { $ne: contractorId },
        });

        if (alreadyExists) {
            throw new ErrorHandler('contractor already exists', BAD_REQUEST);
        }

        contractor.fullName = fullName || contractor.fullName;
        contractor.phoneNumber = phoneNumber || contractor.phoneNumber;
        contractor.email = email || contractor.email;
        await contractor.save();

        const { password: _, ...rest } = contractor.toObject();

        return res.status(OK).json(rest);
    }
);

// todo: remove this feature instead add update password
export const changeContractor = tryCatch(
    'chnage contractor',
    async (req, res) => {
        const { contractorId } = req.params;
        const { fullName, phoneNumber, email } = req.body;

        if (!fullName || !phoneNumber || !email) {
            return res.status(BAD_REQUEST).json({ message: 'Missing Fields' });
        }

        const isValid = ['fullName', 'email', 'phoneNumber'].every((key) =>
            verifyExpression(key, req.body[key]?.trim())
        );

        if (!isValid) {
            throw new ErrorHandler('Invalid input data', BAD_REQUEST);
        }

        let alreadyExists = await Contractor.findOne({
            $or: [{ phoneNumber }, { email: email.toLowerCase() }],
            _id: { $ne: contractorId },
        });

        if (alreadyExists) {
            throw new ErrorHandler('contractor already exists', BAD_REQUEST);
        }

        let randomPassword = nanoid(8);
        randomPassword = await bcrypt.hash(randomPassword, 10);

        const contractor = await Contractor.findByIdAndUpdate(
            contractorId,
            {
                $set: {
                    fullName,
                    phoneNumber,
                    email,
                    password: randomPassword,
                },
            },
            { new: true }
        );
        const canteen = await Canteen.findById(contractor.canteenId);

        await sendMail({
            receiverName: fullName,
            receiverMail: email,
            subject: 'Welcome to SnackTrack',
            html: `
                Hello ${fullName}, <br>
                Welcome to SnackTrack! <br>
                You are now the manager of the Canteen of Hostel: ${canteen.hostelType}${canteen.hostelNumber}-${canteen.hostelName}. <br>
                Your Temporary password is <b>${randomPassword}</b>
            `,
        });

        return res.status(OK).json(contractor);
    }
);

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

import {
    OK,
    COOKIE_OPTIONS,
    NOT_FOUND,
    BAD_REQUEST,
    FORBIDDEN,
} from '../Constants/index.js';
import {
    tryCatch,
    verifyExpression,
    ErrorHandler,
    sendMail,
    verifyQR,
} from '../Utils/index.js';
import { generateTokens } from '../Helpers/index.js';
import { Canteen, Student, Contractor } from '../Models/index.js';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

export const login = tryCatch('login student', async (req, res) => {
    const { userName, password } = req.body;

    if (!userName || !password) {
        throw new ErrorHandler('missing fields', BAD_REQUEST);
    }

    const student = await Student.findOne({ userName })
        .select('-refreshToken')
        .populate('canteenId')
        .lean();

    if (!student) throw new ErrorHandler('student not found', NOT_FOUND);

    const hostelName = student.canteenId.hostelName;
    const hostelNumber = student.canteenId.hostelNumber;
    const hostelType = student.canteenId.hostelType;
    const isOpen = student.canteenId.isOpen;
    student.canteenId = student.canteenId._id;

    const isPassValid = bcrypt.compareSync(password, student.password);
    if (!isPassValid) {
        throw new ErrorHandler('invalid credentials', BAD_REQUEST);
    }

    // generate tokens
    const { accessToken, refreshToken } = await generateTokens({
        _id: student._id,
        role: 'student',
    });

    await Student.findByIdAndUpdate(student._id, { $set: { refreshToken } });

    const { password: _, ...user } = student;

    return res
        .status(OK)
        .cookie('accessToken', accessToken, {
            ...COOKIE_OPTIONS,
            maxAge: Number(process.env.ACCESS_TOKEN_MAXAGE),
        })
        .cookie('refreshToken', refreshToken, {
            ...COOKIE_OPTIONS,
            maxAge: Number(process.env.REFRESH_TOKEN_MAXAGE),
        })
        .json({
            ...user,
            role: 'student',
            isOpen,
            hostelType,
            hostelNumber,
            hostelName,
        });
});

export const loginFromQR = tryCatch(
    'login student from qr',
    async (req, res) => {
        const { decode } = req.body;
        const { _id, token } = decode;

        if (!_id || !token) {
            throw new ErrorHandler('invalid qr code', FORBIDDEN);
        }

        const student = await Student.findById(_id)
            .populate('canteenId', 'hostelName hostelNumber hostelType')
            .select('-refreshToken')
            .lean();

        if (!student) throw new ErrorHandler('invalid qr code', FORBIDDEN);

        verifyQR({ token, passHash: student.password });

        const hostelName = student.canteenId.hostelName;
        const hostelNumber = student.canteenId.hostelNumber;
        const hostelType = student.canteenId.hostelType;
        const isOpen = student.canteenId.isOpen;
        student.canteenId = student.canteenId._id;

        // generate tokens
        const { accessToken, refreshToken } = await generateTokens({
            _id,
            role: 'student',
        });

        await Student.findByIdAndUpdate(_id, { $set: { refreshToken } });

        return res
            .status(OK)
            .cookie('accessToken', accessToken, {
                ...COOKIE_OPTIONS,
                maxAge: Number(process.env.ACCESS_TOKEN_MAXAGE),
            })
            .cookie('refreshToken', refreshToken, {
                ...COOKIE_OPTIONS,
                maxAge: Number(process.env.REFRESH_TOKEN_MAXAGE),
            })
            .json({
                ...student,
                role: 'student',
                isOpen,
                hostelType,
                hostelNumber,
                hostelName,
            });
    }
);

export const logout = tryCatch('logout user', async (req, res) => {
    const { _id, role } = req.user;
    const Model = role === 'contractor' ? Contractor : Student;
    await Model.findByIdAndUpdate(
        _id,
        { $set: { refreshToken: '' } },
        { new: true }
    );

    return res
        .status(OK)
        .clearCookie('accessToken', COOKIE_OPTIONS)
        .clearCookie('refreshToken', COOKIE_OPTIONS)
        .json({ message: 'user loggedout successfully' });
});

export const getCurrentUser = tryCatch('get current user', async (req, res) => {
    let { password, refreshToken, ...user } = req.user;

    if (user.canteenId) {
        // populate canteen Info
        const canteen = await Canteen.findById(user.canteenId);
        const { hostelName, hostelNumber, hostelType, isOpen } = canteen;
        return res
            .status(OK)
            .json({ ...user, hostelType, hostelNumber, hostelName, isOpen });
    } else {
        return res.status(OK).json(req.user);
    }
});

export const updatePassword = tryCatch('update password', async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const { password, _id, role } = req.user;

    const isPassValid = bcrypt.compareSync(oldPassword, password);
    if (!isPassValid) {
        throw new ErrorHandler('invalid credentials', BAD_REQUEST);
    }

    const isValid = verifyExpression('password', newPassword);
    if (!isValid) throw new ErrorHandler('invalid password', BAD_REQUEST);

    // hash new password
    const hashedNewPassword = bcrypt.hashSync(newPassword, 10);

    const Model = role === 'contractor' ? Contractor : Student;
    await Model.findByIdAndUpdate(_id, {
        $set: { password: hashedNewPassword },
    });

    return res.status(OK).json({ message: 'password updated successfully' });
});

export const resetPassword = tryCatch('reset password', async (req, res) => {
    const { _id, role, email, fullName } = req.user;

    const randomPassword = nanoid(8);

    // hash new password
    const hashedNewPassword = bcrypt.hashSync(randomPassword, 10);

    const Model = role === 'contractor' ? Contractor : Student;
    await Model.findByIdAndUpdate(_id, {
        $set: { password: hashedNewPassword },
    });

    // send this password on student's email
    await sendMail({
        receiverName: fullName,
        receiverMail: email,
        subject: 'Welcome to SnackTrack',
        html: `Hello ${fullName}, <br> Your temporary password is <b>${randomPassword}</b>`,
    });

    return res.status(OK).json({ message: 'new password sent to email' });
});

export const updateAccountDetails = tryCatch(
    'update account details',
    async (req, res) => {
        const { _id, password } = req.user;
        const { email, phoneNumber, role } = req.body;
        const data = { email, phoneNumber, password };

        // input error handling
        if (!email || !phoneNumber) {
            throw new ErrorHandler('missing fields', BAD_REQUEST);
        }

        for (const [key, value] of Object.entries(data)) {
            if (value && key !== 'password') {
                const isValid = verifyExpression(key, value);
                if (!isValid) {
                    throw new ErrorHandler(`${key} is invalid.`, BAD_REQUEST);
                }
            }
        }

        const isPassValid = bcrypt.compareSync(data.password, password);
        if (!isPassValid) {
            throw new ErrorHandler('invalid credentials', BAD_REQUEST);
        }

        const Model = role === 'contractor' ? Contractor : Student;

        // check for existing email or phone number
        const user = await Model.findOne({
            $or: [{ email }, { phoneNumber }],
        });

        if (user && user._id.toString() !== _id) {
            throw new ErrorHandler(
                'email or phone number already in use',
                BAD_REQUEST
            );
        }

        user.email = email;
        user.phoneNumber = phoneNumber;
        await user.save();

        return res
            .status(OK)
            .json({ message: 'account details updated successfully' });
    }
);

export const getCanteens = tryCatch('get canteens', async (req, res) => {
    const canteens = await Canteen.find();
    return res.status(OK).json(canteens);
});

export const verifyKitchenKey = tryCatch(
    'verify kitchen key',
    async (req, res) => {
        const { key } = req.body;
        const { canteenId } = req.params;

        if (!key) {
            throw new ErrorHandler('missing key', BAD_REQUEST);
        }

        const contractor = await Contractor.findOne({ canteenId })
            .populate('canteenId', 'hostelName hostelNumber hostelType isOpen')
            .select('-refreshToken')
            .lean();

        if (!contractor) {
            throw new ErrorHandler('contractor not found', NOT_FOUND);
        }

        const isValid = await bcrypt.compare(key, contractor.password);
        if (!isValid) throw new ErrorHandler('invalid key', BAD_REQUEST);

        const hostelName = contractor.canteenId.hostelName;
        const hostelNumber = contractor.canteenId.hostelNumber;
        const hostelType = contractor.canteenId.hostelType;
        const isOpen = contractor.canteenId.isOpen;
        contractor.canteenId = contractor.canteenId._id;
        const { password, ...rest } = contractor;

        const { accessToken, refreshToken } = await generateTokens({
            _id: contractor._id,
            role: 'contractor',
        });

        return res
            .status(OK)
            .cookie('accessToken', accessToken, {
                ...COOKIE_OPTIONS,
                maxAge: Number(process.env.ACCESS_TOKEN_MAXAGE),
            })
            .cookie('refreshToken', refreshToken, {
                ...COOKIE_OPTIONS,
                maxAge: Number(process.env.REFRESH_TOKEN_MAXAGE),
            })
            .json({
                ...rest,
                role: 'contractor',
                hostelType,
                isOpen,
                hostelNumber,
                hostelName,
            });
    }
);

export const verifyKioskKey = tryCatch('verify kiosk key', async (req, res) => {
    const { key } = req.body;
    const { canteenId } = req.params;

    if (!key) {
        throw new ErrorHandler('missing key', BAD_REQUEST);
    }

    const canteen = await Contractor.findById(canteenId)
        .populate('contractorId', 'password')
        .select('hostelType hostelNumber hostelName contractorId')
        .lean();

    if (!canteen) {
        throw new ErrorHandler('canteen not found', NOT_FOUND);
    }

    const isValid = await bcrypt.compare(key, canteen.contractorId.password);
    if (!isValid) throw new ErrorHandler('invalid key', BAD_REQUEST);

    return res.status(OK).json({
        canteenId,
        hostelType: canteen.hostelType,
        hostelNumber: canteen.hostelNumber,
        hostelName: canteen.hostelName,
    });
});

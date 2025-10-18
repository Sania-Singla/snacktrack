import {
    OK,
    COOKIE_OPTIONS,
    NOT_FOUND,
    BAD_REQUEST,
} from '../Constants/index.js';
import {
    tryCatch,
    verifyExpression,
    ErrorHandler,
    sendMail,
} from '../Utils/index.js';
import { generateTokens } from '../Helpers/index.js';
import { Canteen, Student, Contractor } from '../Models/index.js';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

const login = tryCatch('login as contractor', async (req, res, next) => {
    const { loginInput, password, role } = req.body;

    if (!loginInput || !password) {
        return next(new ErrorHandler('missing fields', BAD_REQUEST));
    }

    let user = null;
    if (role === 'contractor') {
        user = await Contractor.findOne({
            $or: [{ email: loginInput }, { phoneNumber: loginInput }],
        });
    } else user = await Student.findOne({ userName: loginInput });

    if (!user) return next(new ErrorHandler('user not found', NOT_FOUND));

    const isPassValid = bcrypt.compareSync(password, user.password);
    if (!isPassValid) {
        return next(new ErrorHandler('invalid credentials', BAD_REQUEST));
    }

    // generate tokens
    const { accessToken, refreshToken } = await generateTokens({
        _id: user._id,
        role,
    });

    const Model = role === 'contractor' ? Contractor : Student;
    const [loggedInUser, canteen] = await Promise.all([
        Model.findByIdAndUpdate(
            user._id,
            { $set: { refreshToken } },
            { new: true }
        )
            .select('-password -refreshToken')
            .lean(),
        Canteen.findById(user.canteenId)
            .select('hostelType hostelNumber hostelName -_id')
            .lean(),
    ]);

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
        .clearCookie('staffToken', COOKIE_OPTIONS)
        .json({ ...loggedInUser, role, ...canteen });
});

const logout = tryCatch('logout user', async (req, res, next) => {
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

const getCurrentUser = tryCatch('get current user', async (req, res, next) => {
    let { password, refreshToken, ...user } = req.user;

    if (user.role === 'admin') {
        return res.status(OK).json(req.user);
    }

    // populate canteen Info
    const canteen = await Canteen.findById(user.canteenId);
    const { hostelName, hostelNumber, hostelType } = canteen;

    return res
        .status(OK)
        .json({ ...user, hostelType, hostelNumber, hostelName });
});

const updatePassword = tryCatch('update password', async (req, res, next) => {
    const { oldPassword, newPassword } = req.body;
    const { password, _id, role } = req.user;

    const isPassValid = bcrypt.compareSync(oldPassword, password);
    if (!isPassValid) {
        return next(new ErrorHandler('invalid credentials', BAD_REQUEST));
    }

    const isValid = verifyExpression('password', newPassword);
    if (!isValid) {
        return next(new ErrorHandler('invalid password', BAD_REQUEST));
    }

    // hash new password
    const hashedNewPassword = bcrypt.hashSync(newPassword, 10);

    const Model = role === 'contractor' ? Contractor : Student;
    await Model.findByIdAndUpdate(_id, {
        $set: { password: hashedNewPassword },
    });

    return res.status(OK).json({ message: 'password updated successfully' });
});

const resetPassword = tryCatch('reset password', async (req, res, next) => {
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
        html: `Hello ${fullName}, <br> Your temporary password is <b>${randomPassword}</b><br> You can update it anytime after logging in from settings.`,
    });

    return res.status(OK).json({ message: 'new password sent to email' });
});

const updateAccountDetails = tryCatch(
    'update account details',
    async (req, res, next) => {
        const { _id, password } = req.user;
        const { email, phoneNumber, role } = req.body;
        const data = { email, phoneNumber, password };

        // input error handling
        if (!email || !phoneNumber) {
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

        const Model = role === 'contractor' ? Contractor : Student;

        // check for existing email or phone number
        const user = await Model.findOne({
            $or: [{ email }, { phoneNumber }],
        });

        if (user && user._id.toString() !== _id) {
            return next(
                new ErrorHandler(
                    'email or phone number already in use',
                    BAD_REQUEST
                )
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

const getCanteens = tryCatch('get canteens', async (req, res) => {
    const canteens = await Canteen.find();
    return res.status(OK).json(canteens);
});

export {
    getCurrentUser,
    login,
    logout,
    updatePassword,
    updateAccountDetails,
    getCanteens,
    resetPassword,
};

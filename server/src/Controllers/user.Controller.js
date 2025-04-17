import {
    OK,
    COOKIE_OPTIONS,
    NOT_FOUND,
    BAD_REQUEST,
    USER_PLACEHOLDER_IMAGE_URL,
    HOSTELS,
} from '../Constants/index.js';
import { tryCatch, verifyExpression, ErrorHandler } from '../Utils/index.js';
import {
    generateTokens,
    uploadOnCloudinary,
    deleteFromCloudinary,
} from '../Helpers/index.js';
import { Canteen, Student, Contractor, Order } from '../Models/index.js';
import bcrypt from 'bcrypt';
import { Types } from 'mongoose';
import { sendMail } from '../mailer.js';
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
            { new: true } // Ensures the updated document is returned
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

    // populate canteen Info
    const canteen = await Canteen.findById(user.canteenId);
    user = {
        ...user,
        hostelType: canteen.hostelType,
        hostelNumber: canteen.hostelNumber,
        hostelName: canteen.hostelName,
    };

    return res.status(OK).json(user);
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
        to: email,
        subject: 'Welcome to SnackTrack',
        html: `Hello ${fullName}, <br> Your temporary password is ${randomPassword}, You can update it anytime after logging in from settings.`,
    });

    return res.status(OK).json({ message: 'new password sent to email' });
});

const updateAvatar = tryCatch('update avatar', async (req, res, next) => {
    let avatarURL;
    try {
        const { _id, avatar, role } = req.user;
        if (!req.file) {
            return next(new ErrorHandler('missing avatar', BAD_REQUEST));
        }

        // upload new avatar on cloudinary
        avatarURL = (await uploadOnCloudinary(req.file.path))?.secure_url;

        // update user avatar
        const Model = role === 'contractor' ? Contractor : Student;
        const updatedUser = await Model.findByIdAndUpdate(
            _id,
            { $set: { avatar: avatarURL } },
            { new: true }
        );

        // delete old avatar
        if (updatedUser && avatar !== USER_PLACEHOLDER_IMAGE_URL) {
            await deleteFromCloudinary(avatar);
        }

        return res.status(OK).json({ newAvatar: updatedUser.avatar });
    } catch (err) {
        if (avatarURL) await deleteFromCloudinary(avatarURL);
        throw err;
    }
});

// for hostel dropdown during student login
const getCanteens = tryCatch('get canteens', async (req, res) => {
    return res.status(200).json(HOSTELS);
});

// for admin page
const getContractors = tryCatch('get contractors', async (req, res) => {
    const canteens = await Canteen.aggregate([
        { $match: {} },
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

// for kitchen page
const getKitchenOrders = tryCatch('get orders', async (req, res, next) => {
    const { hostelType, hostelNumber } = req;

    const canteen = await Canteen.findOne({ hostelType, hostelNumber });

    const now = new Date();

    // Set start time
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    // Set end time
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // Fetch today's orders from this canteen
    const orders = await Order.aggregatePaginate(
        [
            {
                $match: {
                    canteenId: new Types.ObjectId(canteen._id),
                    createdAt: { $gte: startOfDay, $lt: endOfDay },
                    status: 'Pending',
                },
            },
            { $unwind: '$items' },
            { $match: { 'items.itemType': 'Snack' } },
            {
                $lookup: {
                    from: 'snacks',
                    localField: 'items.itemId',
                    foreignField: '_id',
                    as: 'snackDetails',
                    pipeline: [{ $project: { name: 1, image: 1 } }],
                },
            },
            {
                $addFields: {
                    'items.name': {
                        $cond: [
                            { $eq: ['$items.itemType', 'Snack'] },
                            { $arrayElemAt: ['$snackDetails.name', 0] },
                            null,
                        ],
                    },
                    'items.image': {
                        $cond: [
                            { $eq: ['$items.itemType', 'Snack'] },
                            { $arrayElemAt: ['$snackDetails.image', 0] },
                            null,
                        ],
                    },
                },
            },
            {
                $group: {
                    _id: '$_id',
                    status: { $first: '$status' },
                    canteenId: { $first: '$canteenId' },
                    studentId: { $first: '$studentId' },
                    items: { $push: '$items' },
                    createdAt: { $first: '$createdAt' },
                    updatedAt: { $first: '$updatedAt' },
                },
            },
            { $project: { snackDetails: 0 } },
        ],
        { sort: { createdAt: 1 } }
    );
    
    return res.status(OK).json({ canteenId: canteen._id, orders: orders.docs });
});

const sendQuery = tryCatch('send query to admin', async (req, res, next) => {
    const { subject, message } = req.body;
    const { email, fullName, phoneNumber } = req.user;

    if (!subject || !message) {
        return next(new ErrorHandler('missing fields', BAD_REQUEST));
    }

    await sendMail({
        from: email,
        to: process.env.ADMIN_EMAIL,
        subject,
        html: `
                <p><b>Subject:</b> ${subject}</p>
                <p><b>Message:</b> ${message}</p>
                <p><b>From:</b> ${fullName}</p>
                <p><b>Phone Number:</b> ${phoneNumber}</p>
            `,
    });

    return res.status(OK).json({ message: 'query sent successfully' });
});

export {
    getCurrentUser,
    login,
    logout,
    getContractors,
    updatePassword,
    updateAvatar,
    getCanteens,
    getKitchenOrders,
    sendQuery,
    resetPassword,
};

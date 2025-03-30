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
        .cookie('snackTrack_accessToken', accessToken, {
            ...COOKIE_OPTIONS,
            maxAge: parseInt(process.env.ACCESS_TOKEN_MAXAGE),
        })
        .cookie('snackTrack_refreshToken', refreshToken, {
            ...COOKIE_OPTIONS,
            maxAge: parseInt(process.env.REFRESH_TOKEN_MAXAGE),
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
        .clearCookie('snackTrack_accessToken', COOKIE_OPTIONS)
        .clearCookie('snackTrack_refreshToken', COOKIE_OPTIONS)
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
    const user = req.user;

    const isPassValid = bcrypt.compareSync(oldPassword, user.password);
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
    await Model.findByIdAndUpdate(user._id, {
        $set: { password: hashedNewPassword },
    });

    return res.status(OK).json({ message: 'password updated successfully' });
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
const getOrders = tryCatch('get orders', async (req, res, next) => {
    const hostelType = req.hostelType;
    const hostelNumber = req.hostelNumber;

    const canteen = await Canteen.findOne({ hostelType, hostelNumber });

    const orders = await Order.aggregate([
        { $match: { canteenId: new Types.ObjectId(canteen._id) } },
        { $unwind: '$items' },
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
            $lookup: {
                from: 'packagedfoods',
                localField: 'items.itemId',
                foreignField: '_id',
                as: 'packagedFoodDetails',
                pipeline: [{ $project: { category: 1 } }],
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
                'items.category': {
                    $cond: [
                        { $eq: ['$items.itemType', 'PackagedFood'] },
                        { $arrayElemAt: ['$packagedFoodDetails.category', 0] },
                        null,
                    ],
                },
            },
        },
        {
            $group: {
                _id: '$_id',
                amount: { $first: '$amount' },
                status: { $first: '$status' },
                canteenId: { $first: '$canteenId' },
                studentId: { $first: '$studentId' },
                items: { $push: '$items' },
                createdAt: { $first: '$createdAt' },
                updatedAt: { $first: '$updatedAt' },
            },
        },
        {
            $lookup: {
                from: 'students',
                localField: 'studentId',
                foreignField: '_id',
                as: 'student',
                pipeline: [{ $project: { fullName: 1, _id: 1, userName: 1 } }],
            },
        },
        { $unwind: '$student' },
        { $project: { snackDetails: 0, packagedFoodDetails: 0 } },
    ]);

    return res.status(OK).json(orders);
});

export {
    getCurrentUser,
    login,
    logout,
    getContractors,
    updatePassword,
    updateAvatar,
    getCanteens,
    getOrders,
};

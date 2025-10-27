import {
    OK,
    COOKIE_OPTIONS,
    NOT_FOUND,
    BAD_REQUEST,
} from '../Constants/index.js';
import { tryCatch, ErrorHandler } from '../Utils/index.js';
import { generateTokens } from '../Helpers/index.js';
import { Canteen, Student, Contractor } from '../Models/index.js';
import bcrypt from 'bcryptjs';

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

    const canteen = await Canteen.findById(canteenId)
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

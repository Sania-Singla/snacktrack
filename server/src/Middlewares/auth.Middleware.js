import jwt from 'jsonwebtoken';
import { BAD_REQUEST, FORBIDDEN, COOKIE_OPTIONS } from '../Constants/index.js';
import {
    extractTokens,
    generateAccessToken,
    generateAdminToken,
} from '../Helpers/index.js';
import { Student, Contractor, Canteen } from '../Models/index.js';
import bcrypt from 'bcryptjs';

/**
 * @param {String} token - token to verify
 * @param {String} type  - type of token (access or refresh)
 * @returns {Object} null or current user object with user role
 */

const verifyToken = async (token, secret, type) => {
    const decodedToken = jwt.verify(token, secret);

    if (!decodedToken) throw new Error(`invalid ${type} token`);

    const model = decodedToken.role === 'student' ? Student : Contractor;
    const currentUser = await model.findById(decodedToken._id).lean();

    if (
        !currentUser ||
        (type === 'refresh' && currentUser.refreshToken !== token)
    ) {
        throw new Error('user not found');
    }

    return { ...currentUser, role: decodedToken.role };
};

/**
 * @param {String} token - staff token to verify
 * @returns {Object} null or current user object with user role
 */

const verifyStaffToken = async (token) => {
    const decodedToken = jwt.verify(token, process.env.STAFF_TOKEN_SECRET);
    if (!decodedToken) throw new Error(`invalid staff token`);

    const canteen = await Canteen.findById(decodedToken.canteenId).lean();

    if (!canteen || !bcrypt.compareSync(decodedToken.key, canteen.kitchenKey)) {
        throw new Error(`invalid key`);
    }

    return {
        userId: null,
        canteenId: decodedToken.canteenId,
        role: 'staff',
    };
};

/**
 * @param {Object} res - http response object
 * @param {String} refreshToken  - refresh token
 * @returns {Object} null or current user object
 */

const refreshAccessToken = async (res, refreshToken) => {
    try {
        const user = await verifyToken(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            'refresh'
        );
        res.cookie(
            'accessToken',
            await generateAccessToken({ _id: user._id, role: user.role }), // new access token
            {
                ...COOKIE_OPTIONS,
                maxAge: Number(process.env.ACCESS_TOKEN_MAXAGE),
            }
        );
        return user;
    } catch (err) {
        throw new Error('missing or invalid refresh token');
    }
};

// Actual middlwares
const verifyJwt = async (req, res, next) => {
    try {
        const { accessToken, refreshToken, staffToken } = extractTokens(req);

        if (staffToken) {
            req.user = await verifyStaffToken(staffToken);
        } else if (accessToken) {
            req.user = await verifyToken(
                accessToken,
                process.env.ACCESS_TOKEN_SECRET,
                'access'
            );
        } else if (refreshToken) {
            req.user = await refreshAccessToken(res, refreshToken); // generate new access token
        } else {
            return res.status(BAD_REQUEST).json({ message: 'tokens missing' });
        }
        return next();
    } catch (err) {
        return res
            .status(FORBIDDEN)
            .clearCookie('accessToken', COOKIE_OPTIONS)
            .clearCookie('refreshToken', COOKIE_OPTIONS)
            .clearCookie('staffToken', COOKIE_OPTIONS)
            .json({
                message: 'expired or invalid jwt token',
                err: err.message,
            });
    }
};

const optionalVerifyJwt = async (req, res, next) => {
    try {
        const { accessToken, refreshToken, staffToken } = extractTokens(req);

        if (accessToken) {
            req.user = await verifyToken(
                accessToken,
                process.env.ACCESS_TOKEN_SECRET,
                'access'
            );
        } else if (refreshToken) {
            req.user = await refreshAccessToken(res, refreshToken); // generate new access token
        } else if (staffToken) {
            req.user = await verifyStaffToken(staffToken);
        }
        return next();
    } catch (err) {
        return res
            .status(FORBIDDEN)
            .clearCookie('accessToken', COOKIE_OPTIONS)
            .clearCookie('refreshToken', COOKIE_OPTIONS)
            .clearCookie('staffToken', COOKIE_OPTIONS)
            .json({
                message: 'expired or invalid jwt token',
                err: err.message,
            });
    }
};

const verifyAdminJwt = async (req, res, next) => {
    try {
        const { adminToken } = extractTokens(req);

        if (adminToken) {
            const decodedToken = jwt.verify(
                adminToken,
                process.env.ADMIN_TOKEN_SECRET
            );
            if (!decodedToken || decodedToken.key !== process.env.ADMIN_KEY) {
                return res
                    .status(FORBIDDEN)
                    .clearCookie('adminToken', COOKIE_OPTIONS)
                    .json({ message: 'Invalid admin key' });
            }
        } else {
            const { key } = req.body;
            if (!key) {
                return res.status(BAD_REQUEST).json({ message: 'missing key' });
            }

            if (key !== process.env.ADMIN_KEY) {
                return res
                    .status(BAD_REQUEST)
                    .json({ message: 'Invalid admin key' });
            }

            const adminToken = await generateAdminToken(key);
            res.cookie('adminToken', adminToken, {
                ...COOKIE_OPTIONS,
                maxAge: Number(process.env.ADMIN_TOKEN_MAXAGE),
            });
        }
        return next();
    } catch (err) {
        return res
            .status(FORBIDDEN)
            .clearCookie('adminToken', COOKIE_OPTIONS)
            .json({
                message: 'expired or invalid admin token',
                err: err.message,
            });
    }
};

export { verifyJwt, optionalVerifyJwt, verifyAdminJwt };

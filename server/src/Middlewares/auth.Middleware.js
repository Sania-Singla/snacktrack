import jwt from 'jsonwebtoken';
import { BAD_REQUEST, FORBIDDEN, COOKIE_OPTIONS } from '../Constants/index.js';
import { extractTokens, generateAccessToken } from '../Helpers/index.js';
import { Student, Contractor } from '../Models/index.js';

/**
 * @param {String} token - token to verify
 * @param {String} type  - type of token (access or refresh)
 * @returns {Object} null or current user object with user role
 */

const validateToken = async (token, type) => {
    const decodedToken = jwt.verify(
        token,
        type === 'access'
            ? process.env.ACCESS_TOKEN_SECRET
            : process.env.REFRESH_TOKEN_SECRET
    );

    if (!decodedToken) throw new Error(`invalid ${type} token`);

    let currentUser = null;
    if (decodedToken.role === 'student') {
        currentUser = await Student.findById(decodedToken._id).lean();
    } else currentUser = await Contractor.findById(decodedToken._id).lean();

    if (
        !currentUser ||
        (type === 'refresh' && currentUser.refreshToken !== token)
    ) {
        throw new Error('user not found');
    }

    return { ...currentUser, role: decodedToken.role };
};

/**
 * @param {Object} res - http response object
 * @param {String} refreshToken  - refresh token
 * @returns {Object} null or current user object
 */

const refreshAccessToken = async (res, refreshToken) => {
    try {
        const user = await validateToken(refreshToken, 'refresh');
        res.cookie(
            'snackTrack_accessToken',
            await generateAccessToken({ _id: user._id, role: user.role }), // new access token
            {
                ...COOKIE_OPTIONS,
                maxAge: parseInt(process.env.ACCESS_TOKEN_MAXAGE),
            }
        );
        return user;
    } catch (err) {
        throw new Error('missing or invalid refresh token');
    }
};

const verifyJwt = async (req, res, next) => {
    try {
        const { accessToken, refreshToken } = extractTokens(req);

        if (accessToken) {
            // verify access token
            req.user = await validateToken(accessToken, 'access');
            return next();
        } else if (refreshToken) {
            // generate new access token
            req.user = await refreshAccessToken(res, refreshToken);
            return next();
        } else {
            return res.status(BAD_REQUEST).json({ message: 'tokens missing' });
        }
    } catch (err) {
        return res
            .status(FORBIDDEN)
            .clearCookie('snackTrack_accessToken', COOKIE_OPTIONS)
            .clearCookie('snackTrack_refreshToken', COOKIE_OPTIONS)
            .json({
                message: 'expired or invalid jwt token',
                err: err.message,
            });
    }
};

const optionalVerifyJwt = async (req, res, next) => {
    try {
        const { accessToken, refreshToken } = extractTokens(req);

        if (accessToken) {
            // verify access token
            req.user = await validateToken(accessToken, 'access');
        } else if (refreshToken) {
            // generate new access token
            req.user = await refreshAccessToken(res, refreshToken);
        }
        return next();
    } catch (err) {
        return res
            .status(FORBIDDEN)
            .clearCookie('snackTrack_accessToken', COOKIE_OPTIONS)
            .clearCookie('snackTrack_refreshToken', COOKIE_OPTIONS)
            .json({
                message: 'expired or invalid jwt token',
                err: err.message,
            });
    }
};

export { verifyJwt, optionalVerifyJwt };

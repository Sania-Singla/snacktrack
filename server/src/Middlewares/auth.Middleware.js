import jwt from 'jsonwebtoken';
import { BAD_REQUEST, FORBIDDEN, COOKIE_OPTIONS } from '../Constants/index.js';
import { extractTokens, generateAccessToken } from '../Helpers/index.js';
import { Student, Contractor } from '../Models/index.js';

/**
 * @param {String} token - token to verify
 * @param {String} secret - secret to verify the token
 * @returns {Object} null or current user object with role
 */
async function verifyToken(token, secret) {
    const decodedToken = jwt.verify(token, secret);

    if (!decodedToken) throw new Error(`invalid jwt token`);

    let user = { role: decodedToken.role };

    switch (decodedToken.role) {
        case 'student':
            const student = await Student.findById(decodedToken._id).lean();
            if (!student) throw new Error('user not found');
            user = { ...user, ...student };
            break;
        case 'contractor':
            const contractor = await Contractor.findById(
                decodedToken._id
            ).lean();
            if (!contractor) throw new Error('user not found');
            user = { ...user, ...contractor };
            break;
        case 'admin':
            if (decodedToken.key !== process.env.ADMIN_KEY) {
                throw new Error('invalid admin key');
            }
            user = { ...user };
            break;
        default:
            throw new Error('invalid role');
    }

    return user;
}

/**
 * @param {String} refreshToken  - refresh token
 * @returns {Object} null or current user object
 */
const renewToken = async (refreshToken) => {
    try {
        const user = await verifyToken(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET
        );

        if (user.refreshToken !== refreshToken) {
            throw new Error('invalid refresh token');
        }

        const token = await generateAccessToken({
            _id: user._id,
            role: user.role,
        });

        return { user, token };
    } catch (err) {
        throw err;
    }
};

export async function verifyJwt(req, res, next) {
    try {
        const { accessToken, refreshToken } = extractTokens(req);

        if (accessToken) {
            req.user = await verifyToken(
                accessToken,
                process.env.ACCESS_TOKEN_SECRET
            );
        } else if (refreshToken) {
            const { user, token } = await renewToken(refreshToken);
            req.user = user;
            res.cookie('accessToken', token, {
                ...COOKIE_OPTIONS,
                maxAge: Number(process.env.ACCESS_TOKEN_MAXAGE),
            });
        } else {
            return res.status(BAD_REQUEST).json({ message: 'tokens missing' });
        }
        return next();
    } catch (err) {
        return res
            .status(FORBIDDEN)
            .clearCookie('accessToken', COOKIE_OPTIONS)
            .clearCookie('refreshToken', COOKIE_OPTIONS)
            .json({
                message: 'expired or invalid jwt token',
                err: err.message,
            });
    }
}

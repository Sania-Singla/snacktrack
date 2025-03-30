import jwt from 'jsonwebtoken';

/**
 * Util to generate both Access & Refresh JWT Tokens
 * @param {Object} data - The data which needs to be in the tokens
 * @returns Tokens as {accessToken, refreshToken}
 */

const generateTokens = async (data) => {
    try {
        const accessToken = await generateAccessToken(data);
        const refreshToken = await generateRefreshToken(data);

        return { accessToken, refreshToken };
    } catch (err) {
        throw new Error(`error occured while generating tokens, error: ${err}`);
    }
};

/**
 * Util to generate Access Token
 * @param {Object} data - The data which needs to be in the token
 * @returns JWT Token
 */

const generateAccessToken = async (data) => {
    return jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    });
};

/**
 * Util to generate Refresh Token
 * @param {Object} data - The data which needs to be in the token
 * @returns JWT Token
 */

const generateRefreshToken = async (data) => {
    return jwt.sign(data, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    });
};

/**
 * Util to generate admin key Token
 * @param {Object} key - The admin key
 * @returns JWT Token
 */

const generateAdminKeyToken = async (key) => {
    return jwt.sign({ key }, process.env.ADMIN_KEY_TOKEN_SECRET, {
        expiresIn: process.env.ADMIN_KEY_TOKEN_EXPIRY,
    });
};

/**
 * Util to generate staff key Token
 * @param {Object} key - The staff key
 * @returns JWT Token
 */

const generateStaffKeyToken = async (key) => {
    return jwt.sign({ key }, process.env.STAFF_KEY_TOKEN_SECRET, {
        expiresIn: process.env.STAFF_KEY_TOKEN_EXPIRY,
    });
};

/**
 * @param {object} req - The http req object to extract the token from.
 * @param {object} tokenName - Name of the token (snackTrack_accessToken or snackTrack_RefreshToken).
 * @returns Token
 */

const extractTokens = (req) => {
    return {
        accessToken:
            req.cookies?.snackTrack_accessToken ||
            req.headers['authorization']?.split(' ')[1],

        refreshToken:
            req.cookies?.snackTrack_refreshToken ||
            req.headers['x-refresh-token'],

        adminKeyToken:
            req.cookies?.snackTrack_adminKeyToken || req.headers['x-admin-key'],

        staffKeyToken:
            req.cookies?.snackTrack_staffKeyToken || req.headers['x-staff-key'],
    };
};

export {
    extractTokens,
    generateTokens,
    generateAccessToken,
    generateRefreshToken,
    generateAdminKeyToken,
    generateStaffKeyToken,
};

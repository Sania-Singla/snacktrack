import jwt from 'jsonwebtoken';
import { FORBIDDEN, COOKIE_OPTIONS, BAD_REQUEST } from '../Constants/index.js';
import {
    extractTokens,
    generateAdminToken,
    generateStaffToken,
} from '../Helpers/index.js';
import { Canteen } from '../Models/index.js';
import bcrypt from 'bcrypt';

const verifyAdminJwt = async (req, res, next) => {
    try {
        const { adminToken } = extractTokens(req);

        if (adminToken) {
            // verify
            const decodedToken = jwt.verify(
                adminToken,
                process.env.ADMIN_TOKEN_SECRET
            );
            if (!decodedToken) {
                return res
                    .status(FORBIDDEN)
                    .clearCookie('adminToken', COOKIE_OPTIONS)
                    .json({ message: 'Invalid admin key token' });
            }
            if (decodedToken.key !== process.env.ADMIN_KEY) {
                return res
                    .status(FORBIDDEN)
                    .clearCookie('adminToken', COOKIE_OPTIONS)
                    .json({ message: 'Invalid admin key' });
            }
            return next();
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
            return next();
        }
    } catch (err) {
        return res
            .status(FORBIDDEN)
            .clearCookie('adminToken', COOKIE_OPTIONS)
            .json({
                message: 'expired or invalid admin key jwt token',
                err: err.message,
            });
    }
};

const verifyStaffJwt = async (req, res, next) => {
    try {
        const { staffToken } = extractTokens(req);
        if (staffToken) {
            // verify
            const decodedToken = jwt.verify(
                staffToken,
                process.env.STAFF_TOKEN_SECRET
            );
            if (!decodedToken) {
                return res
                    .status(FORBIDDEN)
                    .clearCookie('staffToken', COOKIE_OPTIONS)
                    .json({ message: 'Invalid staff token' });
            }
            const [canteenId] = decodedToken.key.split('-');
            req.canteenId = canteenId;
            return next();
        } else if (req.user?.role === 'contractor') {
            req.canteenId = req.user.canteenId;
            return next();
        } else {
            const { key } = req.body;
            if (!key) {
                return res.status(BAD_REQUEST).json({ message: 'missing key' });
            }
            const [canteenId, actualKey] = key.split('-');
            const canteen = await Canteen.findById(canteenId);

            const isValid = bcrypt.compareSync(actualKey, canteen.kitchenKey);
            if (!isValid) {
                return res.status(BAD_REQUEST).json({ message: 'Invalid key' });
            }
            const staffToken = await generateStaffToken(key);
            res.cookie('staffToken', staffToken, {
                ...COOKIE_OPTIONS,
                maxAge: Number(process.env.STAFF_TOKEN_MAXAGE),
            });
            req.canteenId = canteenId;
            return next();
        }
    } catch (err) {
        return res
            .status(FORBIDDEN)
            .clearCookie('staffToken', COOKIE_OPTIONS)
            .json({
                message: 'expired or invalid staff key jwt token',
                err: err.message,
            });
    }
};

export { verifyAdminJwt, verifyStaffJwt };

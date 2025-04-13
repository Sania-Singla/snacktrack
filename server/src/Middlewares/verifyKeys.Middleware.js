import jwt from 'jsonwebtoken';
import { FORBIDDEN, COOKIE_OPTIONS, BAD_REQUEST } from '../Constants/index.js';
import {
    extractTokens,
    generateAdminKeyToken,
    generateStaffKeyToken,
} from '../Helpers/index.js';
import { Canteen } from '../Models/index.js';
import bcrypt from 'bcrypt';

const verifyAdminKeyJwt = async (req, res, next) => {
    try {
        const { adminKeyToken } = extractTokens(req);

        if (adminKeyToken) {
            // verify
            const decodedToken = jwt.verify(
                adminKeyToken,
                process.env.ADMIN_KEY_TOKEN_SECRET
            );
            if (!decodedToken) {
                return res
                    .status(FORBIDDEN)
                    .clearCookie('adminKeyToken', COOKIE_OPTIONS)
                    .json({ message: 'Invalid admin key token' });
            }
            return next();
        } else {
            const { key } = req.body;
            if (!key) {
                return res.status(BAD_REQUEST).json({ message: 'missing key' });
            }
            if (key !== process.env.ADMIN_KEY) {
                return res.status(BAD_REQUEST).json({ message: 'Invalid key' });
            }
            const adminKeyToken = await generateAdminKeyToken(key);
            res.cookie('adminKeyToken', adminKeyToken, {
                ...COOKIE_OPTIONS,
                maxAge: Number(process.env.ADMIN_KEY_TOKEN_MAXAGE),
            });
            return next();
        }
    } catch (err) {
        return res
            .status(FORBIDDEN)
            .clearCookie('adminKeyToken', COOKIE_OPTIONS)
            .json({
                message: 'expired or invalid admin key jwt token',
                err: err.message,
            });
    }
};

const verifyStaffKeyJwt = async (req, res, next) => {
    try {
        const { staffKeyToken } = extractTokens(req);
        if (staffKeyToken) {
            // verify
            const decodedToken = jwt.verify(
                staffKeyToken,
                process.env.STAFF_KEY_TOKEN_SECRET
            );
            if (!decodedToken) {
                return res
                    .status(FORBIDDEN)
                    .clearCookie('staffKeyToken', COOKIE_OPTIONS)
                    .json({ message: 'Invalid staff key token' });
            }
            const [hostel] = decodedToken.key.split('-');
            const match = hostel.match(/([A-Za-z]+)(\d+)/);
            if (match) {
                req.hostelType = match[1]; // The alphabetic part (e.g., "GH", "WWH")
                req.hostelNumber = Number(match[2]); // The numeric part (e.g., 10)
            }
            return next();
        } else {
            const { key } = req.body;
            if (!key) {
                return res.status(BAD_REQUEST).json({ message: 'missing key' });
            }
            const [hostel, actualKey] = key.split('-');
            const match = hostel.match(/([A-Za-z]+)(\d+)/);
            let hostelType, hostelNumber;
            if (match) {
                hostelType = match[1]; // The alphabetic part (e.g., "GH", "WWH")
                hostelNumber = Number(match[2]); // The numeric part (e.g., 10)
            }

            const canteen = await Canteen.findOne({ hostelType, hostelNumber });
            const isValid = bcrypt.compareSync(actualKey, canteen.kitchenKey);
            if (!isValid) {
                return res.status(BAD_REQUEST).json({ message: 'Invalid key' });
            }
            const staffKeyToken = await generateStaffKeyToken(key);
            res.cookie('staffKeyToken', staffKeyToken, {
                ...COOKIE_OPTIONS,
                maxAge: Number(process.env.STAFF_KEY_TOKEN_MAXAGE),
            });
            req.hostelType = hostelType;
            req.hostelNumber = hostelNumber;
            return next();
        }
    } catch (err) {
        return res
            .status(FORBIDDEN)
            .clearCookie('staffKeyToken', COOKIE_OPTIONS)
            .json({
                message: 'expired or invalid staff key jwt token',
                err: err.message,
            });
    }
};

export { verifyAdminKeyJwt, verifyStaffKeyJwt };

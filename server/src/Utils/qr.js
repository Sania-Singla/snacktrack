import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';
import { ErrorHandler } from './index.js';
import { FORBIDDEN } from '../Constants/errorCodes.js';

const genSecret = (passHash) => process.env.QR_SECRET + passHash.slice(5, 10);

export async function genQR({ _id, passHash }) {
    try {
        const secret = genSecret(passHash);
        const token = jwt.sign({}, secret);
        const qr = await QRCode.toDataURL(JSON.stringify({ token, _id }));
        return qr; // a base64 PNG image, we can embed in <img> tag
    } catch (err) {
        throw new ErrorHandler('Failed to generate QR');
    }
}

export async function verifyQR({ token, passHash }) {
    try {
        const secret = genSecret(passHash);
        const decode = jwt.verify(token, secret);
        if (!decode) throw new ErrorHandler('invalid qr code', FORBIDDEN);
        else return decode;
    } catch (err) {
        throw new ErrorHandler('invalid qr code', FORBIDDEN);
    }
}

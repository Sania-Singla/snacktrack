import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';
import { ErrorHandler } from './index.js';
import { FORBIDDEN } from '../Constants/errorCodes.js';

function genSecret(passHash) {
    return process.env.QR_SECRET + passHash.slice(5, 10);
}

export async function genQR({ _id, passHash }) {
    try {
        const secret = genSecret(passHash);
        const token = jwt.sign({}, secret);
        const qrDataURL = QRCode.toDataURL(JSON.stringify({ token, _id }));
        return qrDataURL; // a base64 PNG image, we can embed in <img> tag
    } catch (err) {
        throw new ErrorHandler('Failed to generate QR');
    }
}

export async function verifyQR({ token, passHash }) {
    try {
        const secret = genSecret(passHash);
        const decode = jwt.verify(token, secret);
        if (!decode) {
            throw new ErrorHandler('invalid qr code', FORBIDDEN);
        }

        return decode;
    } catch (err) {
        throw new ErrorHandler('invalid qr code', FORBIDDEN);
    }
}

// console.log(
//     await genQR({
//         _id: '68d92279ca528b77aee5e4bf',
//         passHash:
//             '$2b$10$ltKLAB/xHty4FSKPZCqFpOG3Ax292W474T/FSamfAY9HK7LZdgXN2',
//     })
// );

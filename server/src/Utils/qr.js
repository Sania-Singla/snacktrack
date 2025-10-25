import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';

export async function genQR(data) {
    try {
        const token = jwt.sign({ data }, process.env.QR_SECRET);
        const qrDataURL = await QRCode.toDataURL(token);
        return qrDataURL; // qrDataURL is a base64 PNG image you can embed in <img> tag
    } catch (err) {
        throw new Error(`Failed to generate QR code ${err}`);
    }
}

export function verifyQR(token) {
    try {
        const decoded = jwt.verify(token, process.env.QR_SECRET);
        return decoded.data;
    } catch (err) {
        throw new Error(`Invalid or expired QR code ${err}`);
    }
}

const secret = '1234';
import crypto from 'crypto';

export function encrypt(rollno) {
    const sign = crypto.createHmac('sha256', secret).digest('base64url');

    return `${rollno}-${sign}`;
}

export function decrypt(data) {
    const arr = data.split('-');
    const rollno = arr[0];
    const sign = arr[1] + '-' + arr[2];

    const decipher = crypto.createHmac('sha256', secret).digest('base64url');

    if (sign !== decipher) {
        console.error('Invalid QR Code');
    }

    return rollno;
}

// console.log(encrypt(12));
const code = encrypt(12);
console.log('code', code);
console.log(decrypt(code));

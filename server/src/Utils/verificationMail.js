import { EmailVerification } from '../Models/index.js';
import { customAlphabet } from 'nanoid';
import { sendMail } from './mailer.js';

async function sendVerificationEmail(name, email) {
    const randomCode = customAlphabet('0123456789', 6)(); // Generate a random 6-digit numeric code for email verification

    // send mail
    await sendMail({
        receiverName: name,
        receiverMail: email,
        subject: 'Welcome to SnackTrack',
        html: `Your Email verification code is ${randomCode}. This code will expire in 1 minute`,
    });

    // save record in db
    return await EmailVerification.create({ email, code: randomCode });
}

async function verifyEmail(email, code) {
    const record = await EmailVerification.findOne({ email, code }).sort({
        createdAt: -1,
    });

    if (!record || record.expiresAt < new Date()) return false;

    // email verified, delete the record from the database
    await EmailVerification.deleteMany({ email });
    return true;
}

export { sendVerificationEmail, verifyEmail };

import { EmailVerification } from '../Models/index.js';
import { customAlphabet } from 'nanoid';
import { sendMail } from '../mailer.js';

async function sendVerificationEmail(email) {
    const randomCode = customAlphabet('0123456789', 6)(); // Generate a random 6-digit numeric code for email verification

    // send mail
    await sendMail({
        to: email,
        subject: 'Welcome to SnackTrack',
        html: `Your Email verification code is ${randomCode}. This code will expire in 1 minute`,
    });

    // save record in db
    return await EmailVerification.create({ email, code: randomCode });
}

async function verifyEmail(email, code, next) {
    const record = await EmailVerification.findOne({ email, code });

    if (!record) return false;

    // email verified, delete the record from the database
    return await EmailVerification.deleteMany({ email });
}

export { sendVerificationEmail, verifyEmail };

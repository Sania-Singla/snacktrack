import { model, Schema } from 'mongoose';

const emailVerificationSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 60, // Automatically deletes the document after 60 seconds (1 minute)
    },
});

export const EmailVerification = model(
    'EmailVerification',
    emailVerificationSchema
);

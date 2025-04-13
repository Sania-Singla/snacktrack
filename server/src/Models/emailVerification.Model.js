import { model, Schema } from 'mongoose';

const emailVerificationSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
        },
        code: {
            type: String,
            required: true,
        },
        expiresAt: {
            type: Date,
            default: () => new Date(Date.now() + 60 * 1000), // 1 minute expiration
        },
    },
    { timestamps: true }
);

// TTL index (but it could lead to delay in deletion so needed explicit expiresAt field)
emailVerificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 });

export const EmailVerification = model(
    'EmailVerification',
    emailVerificationSchema
);

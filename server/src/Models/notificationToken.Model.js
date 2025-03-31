import { Schema, Types, model } from 'mongoose';

const NotificationTokensSchema = new Schema(
    {
        userId: {
            type: Types.ObjectId,
            required: true,
            ref: 'User',
        },
        token: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

export const NotificationToken = new model(
    'NotificationToken',
    NotificationTokensSchema
);

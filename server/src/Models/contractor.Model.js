import { Schema, model, Types } from 'mongoose';
import bcrypt from 'bcrypt';

const contractorSchema = new Schema(
    {
        canteenId: {
            type: Types.ObjectId,
            ref: 'Canteen',
            required: true,
        },
        fullName: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
            default: '',
            required: false,
        },
        email: {
            type: String,
            unique: true,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        phoneNumber: {
            type: String,
            required: true,
            unique: true,
        },
        refreshToken: {
            type: String,
            default: '',
        },
    },
    { timestamps: true }
);

// Hash password before saving
contractorSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

export const Contractor = new model('Contractor', contractorSchema);

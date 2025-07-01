import { Schema, Types, model } from 'mongoose';
import bcrypt from 'bcryptjs';

const canteenSchema = new Schema(
    {
        contractorId: {
            type: Types.ObjectId,
            ref: 'Contractor',
        },
        hostelType: {
            type: String,
            enum: ['GH', 'BH', 'IH', 'WWH'],
            required: true,
        },
        hostelName: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        hostelNumber: {
            type: Number,
            required: true,
        },
        kitchenKey: {
            type: String,
            required: false,
        },
    },
    { timestamps: true }
);

// Hash kitchenKey before saving pre hook
canteenSchema.pre('save', async function (next) {
    if (!this.isModified('kitchenKey')) return next();
    this.kitchenKey = bcrypt.hashSync(this.kitchenKey, 10);
    next();
});

export const Canteen = new model('Canteen', canteenSchema);

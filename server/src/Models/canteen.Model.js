import { Schema, Types, model } from 'mongoose';

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
    },
    { timestamps: true }
);

export const Canteen = new model('Canteen', canteenSchema);

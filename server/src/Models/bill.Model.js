import { Schema, Types, model } from 'mongoose';

const billSchema = new Schema(
    {
        studentId: {
            type: Types.ObjectId,
            ref: 'Student',
            required: true,
        },
        canteenId: {
            type: Types.ObjectId,
            ref: 'Canteen',
            required: true,
        },
        month: {
            type: String,
            required: true,
        },
        year: {
            type: Number,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        paid: {
            type: Boolean,
            default: false,
        },
        paidDate: {
            type: Date,
            default: null,
        },
        orderIds: [
            {
                type: Types.ObjectId,
                ref: 'Order',
                required: true,
            },
        ],
    },
    { timestamps: true }
);

export const Bill = model('Bill', billSchema);

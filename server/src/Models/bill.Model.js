import { Schema, Types, model } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

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
            type: Number,
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
        paidOn: {
            type: Date,
        },
    },
    { timestamps: true }
);

billSchema.plugin(mongooseAggregatePaginate);

export const Bill = model('Bill', billSchema);

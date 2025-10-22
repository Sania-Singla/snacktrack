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
    },
    { timestamps: true }
);

billSchema.index({ studentId: 1 });
billSchema.index({ canteenId: 1, month: 1 });

billSchema.plugin(mongooseAggregatePaginate);

export const Bill = model('Bill', billSchema);

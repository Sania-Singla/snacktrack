import { model, Schema, Types } from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const snackSchema = new Schema(
    {
        canteenId: {
            type: Types.ObjectId,
            required: true,
            ref: 'Canteen',
        },
        image: {
            type: String,
            required: false,
        },
        name: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        isAvailable: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

snackSchema.plugin(mongooseAggregatePaginate);

export const Snack = new model('Snack', snackSchema);

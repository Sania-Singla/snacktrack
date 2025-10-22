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
            default: '',
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

snackSchema.index({ canteenId: 1, name: 1 }); // If you search snacks by name
snackSchema.index({ canteenId: 1 }); // If you show all snacks (admin view)

snackSchema.plugin(mongooseAggregatePaginate);

export const Snack = new model('Snack', snackSchema);

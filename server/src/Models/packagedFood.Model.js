import { Schema, model, Types } from 'mongoose';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

const packagedFoodSchema = new Schema(
    {
        canteenId: {
            type: Types.ObjectId,
            required: true,
            ref: 'Canteen',
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
            default: false,
        },
    },
    { timestamps: true }
);

packagedFoodSchema.plugin(aggregatePaginate);

export const PackagedFood = new model('PackagedFood', packagedFoodSchema);

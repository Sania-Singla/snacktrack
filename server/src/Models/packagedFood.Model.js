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
            default: true,
        },
    },
    { timestamps: true }
);

packagedFoodSchema.index({ canteenId: 1, name: 1 }); // If you search items by name
packagedFoodSchema.index({ canteenId: 1 }); // If you show all items (admin view)

packagedFoodSchema.plugin(aggregatePaginate);

export const PackagedFood = new model('PackagedFood', packagedFoodSchema);

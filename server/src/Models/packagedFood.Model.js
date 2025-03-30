import { Schema, model, Types } from 'mongoose';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

const packagedFoodSchema = new Schema(
    {
        canteenId: {
            type: Types.ObjectId,
            required: true,
            ref: 'Canteen',
        },
        category: {
            type: String,
            required: true,
        },
        variants: [
            {
                price: {
                    type: Number,
                    required: true,
                },
                availableCount: {
                    type: Number,
                    default: 0,
                },
            },
        ],
    },
    { timestamps: true }
);

packagedFoodSchema.plugin(aggregatePaginate);

export const PackagedFood = new model('PackagedFood', packagedFoodSchema);

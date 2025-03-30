import { Schema, Types, model } from 'mongoose';

// idea: single canteen has a single contractor
//       single canteen has multiple snacks & packaged food items (limited: so array would be more efficient)
//       single canteen belongs to a single hostel
const canteenSchema = new Schema(
    {
        contractorId: {
            type: Types.ObjectId,
            ref: 'Contractor',
        },
        hostelType: {
            type: String,
            enum: ['GH', 'BH', 'IH'],
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
            required: true,
        },
        snacks: [
            {
                type: Types.ObjectId,
                ref: 'Snack',
            },
        ],
        packagedItems: [
            {
                type: Types.ObjectId,
                ref: 'PackagedFood',
            },
        ],
    },
    { timestamps: true }
);

export const Canteen = new model('Canteen', canteenSchema);

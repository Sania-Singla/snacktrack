import { Schema, Types, model } from 'mongoose';
import bcrypt from 'bcrypt';

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
    },
    { timestamps: true }
);

// Hash kitchenKey before saving pre hook
canteenSchema.pre('save', async function (next) {
    if (!this.isModified('kitchenKey')) return next();
    this.kitchenKey = bcrypt.hashSync(this.kitchenKey, 10);
    next();
});

export const Canteen = new model('Canteen', canteenSchema);

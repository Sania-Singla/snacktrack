import { Schema, model, Types } from 'mongoose';
import aggregatePaginate from 'mongoose-aggregate-paginate-v2';

const orderSchema = new Schema(
    {
        studentId: {
            type: Types.ObjectId,
            required: true,
            ref: 'Student',
        },
        canteenId: {
            type: Types.ObjectId,
            required: true,
            ref: 'Canteen',
        },
        status: {
            type: String,
            required: true,
            enum: ['New', 'Pending', 'Prepared', 'PickedUp', 'Rejected'], // Cancellation not allowed
            default: 'New',
        },
        amount: {
            type: Number,
            required: true,
        },
        extraCharges: {
            type: Number,
            default: 0,
        },
        items: [
            {
                type: {
                    type: String,
                    required: true,
                    enum: ['PackagedFood', 'Snack'],
                },
                id: {
                    type: Types.ObjectId,
                    required: true,
                    refPath: 'items.type', // Dynamic reference based on itemType
                },
                quantity: {
                    type: Number,
                    required: true,
                    default: 1,
                },
                specialInstructions: {
                    type: String,
                    default: '',
                },
                price: {
                    type: Number,
                    required: true,
                },
            },
        ],
    },
    { timestamps: true }
);

orderSchema.index({ canteenId: 1, status: 1 }); // Main query index
orderSchema.index({ canteenId: 1 }); // For date filtering without status
orderSchema.index({ studentId: 1 }); // For student's order history

orderSchema.plugin(aggregatePaginate);

export const Order = new model('Order', orderSchema);

import { model, Schema, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const studentSchema = new Schema(
    {
        canteenId: {
            type: Types.ObjectId,
            required: true,
            ref: 'Canteen',
        },
        userName: {
            // ex: GH8-75
            type: String,
            unique: true,
            required: true,
            index: true,
            trim: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
        phoneNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        },
        refreshToken: {
            type: String,
            default: '',
        },
    },
    { timestamps: true }
);

studentSchema.index({ canteenId: 1, fullName: 1 }); // If you search students by name
studentSchema.index({ canteenId: 1, userName: 1 }); // If you search students by userName
studentSchema.index({ canteenId: 1 }); // If you show all students

studentSchema.plugin(mongooseAggregatePaginate);

// Hash password before saving pre hook
studentSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = bcrypt.hashSync(this.password, 10);
    next();
});

export const Student = new model('Student', studentSchema);

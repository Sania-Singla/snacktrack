import mongoose from 'mongoose';

export const connectMongoDB = async () => {
    try {
        const conn = await mongoose.connect(
            `${process.env.MONGODB_URL}${process.env.MONGODB_NAME}`
        );
        return console.log(
            `✅ MongoDB connected, host: ${conn.connection.host}`
        );
    } catch (err) {
        return console.log('❌ MongoDB connection Failed !!', err);
    }
};

import mongoose from 'mongoose';

export const connectMongoDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URL);
        console.log(`Mongodb connected: ${conn.connection.host}`);
        return conn;
    } catch (err) {
        throw new Error(`MongoDB connection failed: ${err}`);
    }
};

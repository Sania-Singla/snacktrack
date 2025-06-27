import mongoose from 'mongoose';

export const connectMongoDB = async () => {
    try {
        const conn = await mongoose.connect(
            `${process.env.MONGODB_URL}${process.env.MONGODB_NAME}`
        );
        console.log(
            `✅ Mongodb connection ready. Host: ${conn.connection.host}`
        );
        return conn;
    } catch (err) {
        console.log('❌ MongoDB connection failed !!', err);
        process.exit(1);
    }
};

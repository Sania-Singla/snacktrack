import { createClient } from 'redis';

export async function connectRedis() {
    try {
        const redisClient = createClient({
            username: process.env.REDIS_USERNAME,
            password: process.env.REDIS_PASSWORD,
            socket: {
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_PORT,
            },
        });

        // for connection error
        redisClient.on('error', (err) =>
            console.log('Redis Client Error', err)
        );

        // avoid creating multiple connections
        if (!redisClient.isOpen) {
            await redisClient.connect();
            console.log('✅ Connected to Redis Successfully.');
        } else console.log('Already have a Redis connection.');

        return redisClient;
    } catch (err) {
        return console.log(err);
    }
}

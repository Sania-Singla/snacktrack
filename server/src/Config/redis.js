import { createClient } from 'redis';

export async function connectRedis() {
    try {
        const client = createClient({
            username: process.env.REDIS_USERNAME,
            password: process.env.REDIS_PASSWORD,
            socket: {
                host: process.env.REDIS_HOST,
                port: process.env.REDIS_PORT,
            },
        });

        // avoid creating multiple connections
        if (!client.isOpen) {
            await client.connect();
            console.log('✅ Redis client ready.');
        } else console.log('Already have a Redis connection.');

        return client;
    } catch (err) {
        throw new Error(`❌ Redis connection failed: ${err}`);
    }
}

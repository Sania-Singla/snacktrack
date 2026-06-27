import { createClient } from 'redis';

export async function connectRedis() {
    const client = createClient({
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
        socket: {
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
        },
    });

    client.on('error', (err) => console.error('Redis error:', err));

    try {
        await client.connect();
        console.log('Redis client ready.');
    } catch (err) {
        throw new Error(`Redis connection failed: ${err}`);
    }

    return client;
}

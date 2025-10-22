import { redisClient } from '../server.js';

export async function joinRoom(socket, { userId, canteenId, role }) {
    if (role === 'student') {
        await redisClient.setEx(userId, 3600, socket.id);
    } else if (role === 'contractor') {
        await redisClient.setEx(canteenId, 43200, socket.id);
    }

    console.log(`[USER JOINED] ${userId} (${socket.id})`);
}

export async function leaveRoom(socket, { userId, canteenId, role }) {
    if (role === 'student') {
        await redisClient.del(userId);
    } else if (role === 'contractor') {
        await redisClient.del(canteenId);
    }

    console.log(`[USER LEFT] ${userId} (${socket.id})`);
}

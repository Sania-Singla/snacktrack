import { redisClient } from '../server.js';

async function setSocketId(userId, socket) {
    return await redisClient.setEx(userId, 3600, socket.id); // 1hr exp
}

async function getSocketId(userId) {
    return await redisClient.get(userId);
}

async function deleteSocketId(userId) {
    return await redisClient.del(userId);
}

export { setSocketId, getSocketId, deleteSocketId };

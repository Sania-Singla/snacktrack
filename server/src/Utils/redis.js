import { redisClient } from '../server.js';

async function setSocketId(id, socket) {
    return await redisClient.setEx(id, 86400, socket.id); // 1day exp
}

async function getSocketId(id) {
    return await redisClient.get(id);
}

async function deleteSocketId(id) {
    return await redisClient.del(id);
}

export { setSocketId, getSocketId, deleteSocketId };

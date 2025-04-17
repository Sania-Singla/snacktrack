import { redisClient } from '../server.js';

// Add a socket ID to a room's set
async function addSocketId(room, socketId) {
    await redisClient.sAdd(room, socketId);
}

// Remove a socket ID from a room
async function deleteSocketId(room, socketId) {
    await redisClient.sRem(room, socketId);
}

export { addSocketId, deleteSocketId };

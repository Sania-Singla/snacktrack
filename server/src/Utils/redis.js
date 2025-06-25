import { redisClient } from '../server.js';

// Add a socket ID to a room's set
async function addSocketId(room, socketId) {
    await redisClient.sAdd(room, socketId);
}

// Remove a socket ID from a room
async function deleteSocketId(room, socketId) {
    await redisClient.sRem(room, socketId);
}

async function addPreparedItem({ itemId, orderId }) {
    const existing = await redisClient.sMembers(`order_${orderId}`);
    const existingItem = existing.find((item) => {
        const parsedItem = JSON.parse(item);
        return parsedItem.itemId === itemId;
    });

    if (existingItem) {
        const parsedItem = JSON.parse(existingItem);
        parsedItem.quantity++;
        await redisClient.sRem(`order_${orderId}`, existingItem);
        await redisClient.sAdd(`order_${orderId}`, JSON.stringify(parsedItem));
    } else {
        const newItem = { itemId, quantity: 1 };
        await redisClient.sAdd(`order_${orderId}`, JSON.stringify(newItem));
    }
}

export { addSocketId, deleteSocketId, addPreparedItem };

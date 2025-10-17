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
    const newItem = { itemId, pickedUp: false };
    await redisClient.sAdd(`order_${orderId}`, JSON.stringify(newItem));
}

async function addPickedUpItem({ itemId, orderId }) {
    const existing = await redisClient.sMembers(`order_${orderId}`);
    const existingItem = existing.find((item) => {
        const parsedItem = JSON.parse(item);
        return parsedItem.itemId === itemId;
    });

    if (existingItem) {
        const parsedItem = JSON.parse(existingItem);
        parsedItem.pickedUp = true; // No Partial Pickups
        await redisClient.sRem(`order_${orderId}`, existingItem);
        await redisClient.sAdd(`order_${orderId}`, JSON.stringify(parsedItem));
    }
}

export { addSocketId, deleteSocketId, addPreparedItem, addPickedUpItem };

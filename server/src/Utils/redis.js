import { redisClient } from '../server.js';

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

export { addPreparedItem, addPickedUpItem };

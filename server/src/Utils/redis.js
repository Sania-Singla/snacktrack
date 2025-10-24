import { redisClient } from '../server.js';

async function addPreparedItem({ itemId, orderId }) {
    const newItem = { itemId: itemId.toString(), pickedUp: false };
    await redisClient.sAdd(
        `order_${orderId.toString()}`,
        JSON.stringify(newItem)
    );
}

async function addPickedUpItem({ itemId, orderId }) {
    const existing = await redisClient.sMembers(`order_${orderId.toString()}`);
    const existingItem = existing.find((item) => {
        const parsedItem = JSON.parse(item);
        return parsedItem.itemId === itemId.toString();
    });

    if (existingItem) {
        const parsedItem = JSON.parse(existingItem);
        parsedItem.pickedUp = true; // No Partial Pickups
        await redisClient.sRem(`order_${orderId.toString()}`, existingItem);
        await redisClient.sAdd(
            `order_${orderId.toString()}`,
            JSON.stringify(parsedItem)
        );
    }
}

export { addPreparedItem, addPickedUpItem };

import { redisClient } from '../server.js';

async function addPreparedItem({ itemId, orderId }) {
    const orderKeyItems = `order:${orderId}:items`;
    await redisClient.sAdd(orderKeyItems, itemId.toString());
}

async function addPickedUpItem({ itemId, orderId }) {
    const orderKeyItems = `order:${orderId}:items`;
    const orderKeyPickup = `order:${orderId}:pickup`;
    const exists = await redisClient.sIsMember(
        orderKeyItems,
        itemId.toString()
    );
    if (exists) {
        // store boolean as tiny int (1 byte vs "true" string 4 bytes)
        await redisClient.hSet(orderKeyPickup, itemId.toString(), 1);
    }
}

export { addPreparedItem, addPickedUpItem };

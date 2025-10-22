import { SOCKET_EVENTS } from '../Constants/index.js';
import { redisClient } from '../server.js';
import {
    safeHandler,
    addPreparedItem,
    addPickedUpItem,
} from '../Utils/index.js';

export function registerItemEvents(io, socket) {
    // 🔹 ITEM PREPARED
    socket.on(
        SOCKET_EVENTS.ITEM_PREPARED,
        safeHandler(async ({ itemId, orderId, studentId, canteenId }) => {
            const [_, stuSocketId, cantSocketId] = await Promise.all([
                await addPreparedItem({ itemId, orderId }),
                await redisClient.get(studentId),
                await redisClient.get(canteenId),
            ]);

            await io
                .to(stuSocketId)
                .to(cantSocketId)
                .emit(SOCKET_EVENTS.ITEM_PREPARED, {
                    itemId,
                    orderId,
                });
        })
    );

    // 🔹 ITEM PICKED UP
    socket.on(
        SOCKET_EVENTS.ITEM_PICKEDUP,
        safeHandler(async ({ itemId, orderId, studentId, canteenId }) => {
            const [_, stuSocketId, cantSocketId] = await Promise.all([
                await addPickedUpItem({ itemId, orderId }),
                await redisClient.get(studentId),
                await redisClient.get(canteenId),
            ]);

            await io
                .to(stuSocketId)
                .to(cantSocketId)
                .emit(SOCKET_EVENTS.ITEM_PICKEDUP, {
                    itemId,
                    orderId,
                });
        })
    );
}

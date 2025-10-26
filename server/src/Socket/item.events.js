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
            const [_, [stuSocketId, cantSocketId]] = await Promise.all([
                addPreparedItem({ itemId, orderId }),
                redisClient.mGet([studentId.toString(), canteenId.toString()]),
            ]);

            io.to(stuSocketId)
                .to(`contractor_${cantSocketId}`)
                .emit(SOCKET_EVENTS.ITEM_PREPARED, { itemId, orderId });
        })
    );

    // 🔹 ITEM PICKED UP
    socket.on(
        SOCKET_EVENTS.ITEM_PICKEDUP,
        safeHandler(async ({ itemId, orderId, studentId, canteenId }) => {
            const [_, [stuSocketId, cantSocketId]] = await Promise.all([
                addPickedUpItem({ itemId, orderId }),
                redisClient.mGet([studentId.toString(), canteenId.toString()]),
            ]);

            io.to(stuSocketId)
                .to(`contractor_${cantSocketId}`)
                .emit(SOCKET_EVENTS.ITEM_PICKEDUP, { itemId, orderId });
        })
    );
}

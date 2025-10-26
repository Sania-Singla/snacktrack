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
            const [_, stuSocketId] = await Promise.all([
                addPreparedItem({ itemId, orderId }),
                redisClient.get(studentId.toString()),
            ]);

            io.to(stuSocketId)
                .to(`contractor_${canteenId}`)
                .emit(SOCKET_EVENTS.ITEM_PREPARED, { itemId, orderId });
        })
    );

    // 🔹 ITEM PICKED UP
    socket.on(
        SOCKET_EVENTS.ITEM_PICKEDUP,
        safeHandler(async ({ itemId, orderId, studentId, canteenId }) => {
            const [_, stuSocketId] = await Promise.all([
                addPickedUpItem({ itemId, orderId }),
                redisClient.get(studentId.toString()),
            ]);

            io.to(stuSocketId)
                .to(`contractor_${canteenId}`)
                .emit(SOCKET_EVENTS.ITEM_PICKEDUP, { itemId, orderId });
        })
    );
}

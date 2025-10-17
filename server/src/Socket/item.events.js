import { SOCKET_EVENTS } from '../Constants/index.js';
import {
    safeHandler,
    addPreparedItem,
    addPickedUpItem,
} from '../Utils/index.js';

export function registerItemEvents(io, socket) {
    // 🔹 ITEM PREPARED
    socket.on(
        SOCKET_EVENTS.ITEM_PREPARED,
        safeHandler(async ({ itemId, order }) => {
            await addPreparedItem({ itemId, orderId: order._id });
            io.to(`contractor_${order.canteenId}`)
                .to(`student_${order.studentId}`)
                .emit(SOCKET_EVENTS.ITEM_PREPARED, {
                    itemId,
                    orderId: order._id,
                    stuId: order.studentId,
                });
        })
    );

    // 🔹 ITEM PICKED UP
    socket.on(
        SOCKET_EVENTS.ITEM_PICKEDUP,
        safeHandler(async ({ itemId, order }) => {
            await addPickedUpItem({ itemId, orderId: order._id });
            io.to(`contractor_${order.canteenId}`)
                .to(`student_${order.studentId}`)
                .emit(SOCKET_EVENTS.ITEM_PICKEDUP, {
                    itemId,
                    orderId: order._id,
                    stuId: order.studentId,
                });
        })
    );
}

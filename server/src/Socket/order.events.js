import { SOCKET_EVENTS } from '../Constants/events.js';
import { redisClient } from '../server.js';
import { safeHandler } from '../Utils/index.js';

export function registerOrderEvents(io, socket) {
    // 🔹 NEW ORDER
    socket.on(
        SOCKET_EVENTS.NEW_ORDER,
        safeHandler(async (order) => {
            order.items.forEach((i) => (i.id = i._id));
            const cantSocketId = await redisClient.get(order.canteenId);
            await io.to(cantSocketId).emit(SOCKET_EVENTS.NEW_ORDER, order);
        })
    );

    // 🔹 ORDER REJECTED
    socket.on(
        SOCKET_EVENTS.ORDER_REJECTED,
        safeHandler(async ({ orderId, studentId, canteenId }) => {
            const [stuSocketId, cantSocketId] = await redisClient.mGet([
                studentId,
                canteenId,
            ]);

            await io
                .to(stuSocketId)
                .to(cantSocketId)
                .emit(SOCKET_EVENTS.ORDER_REJECTED, orderId);
        })
    );

    // 🔹 ORDER PREPARED
    socket.on(
        SOCKET_EVENTS.ORDER_PREPARED,
        safeHandler(async ({ orderId, studentId, canteenId }) => {
            const [stuSocketId, cantSocketId] = await redisClient.mGet([
                studentId,
                canteenId,
            ]);

            await io
                .to(stuSocketId)
                .to(cantSocketId)
                .emit(SOCKET_EVENTS.ORDER_PREPARED, orderId);
        })
    );

    // 🔹 ORDER PICKED UP
    socket.on(
        SOCKET_EVENTS.ORDER_PICKEDUP,
        safeHandler(async ({ orderId, studentId, canteenId }) => {
            const [stuSocketId, cantSocketId] = await redisClient.mGet([
                studentId,
                canteenId,
            ]);

            await io
                .to(stuSocketId)
                .to(cantSocketId)
                .emit(SOCKET_EVENTS.ORDER_PICKEDUP, orderId);
        })
    );

    // 🔹 EXTRA CHARGES UPDATED
    socket.on(
        SOCKET_EVENTS.EXTRA_CHARGES_UPDATED,
        safeHandler(async ({ orderId, extraCharges, studentId }) => {
            const stuSocketId = await redisClient.get(studentId);
            await io.to(stuSocketId).emit(SOCKET_EVENTS.EXTRA_CHARGES_UPDATED, {
                orderId,
                extraCharges,
            });
        })
    );
}

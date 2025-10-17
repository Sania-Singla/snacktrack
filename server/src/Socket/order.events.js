import { SOCKET_EVENTS } from '../Constants/events.js';
import {
    safeHandler,
    sendOrderPickedUpSMS,
    sendOrderPlacedSMS,
    sendOrderPreparedSMS,
    sendOrderRejectedSMS,
} from '../Utils/index.js';

export function registerOrderEvents(io, socket) {
    // 🔹 NEW ORDER
    socket.on(
        SOCKET_EVENTS.NEW_ORDER,
        safeHandler(async (order) => {
            order.items.forEach((i) => (i.id = i._id));
            await Promise.all([
                io
                    .to(`contractor_${order.canteenId}`)
                    .emit(SOCKET_EVENTS.NEW_ORDER, order),
                // sendOrderPlacedSMS({
                //     to: order.studentInfo.phoneNumber,
                //     orderId: order._id,
                // }),
            ]);
        })
    );

    // 🔹 ORDER REJECTED
    socket.on(
        SOCKET_EVENTS.ORDER_REJECTED,
        safeHandler(async (order) => {
            await Promise.all([
                io
                    .to(`student_${order.studentId}`)
                    .to(`contractor_${order.canteenId}`)
                    .emit(SOCKET_EVENTS.ORDER_REJECTED, order),
                sendOrderRejectedSMS({
                    to: order.studentInfo.phoneNumber,
                    orderId: order._id,
                }),
            ]);
        })
    );

    // 🔹 ORDER PREPARED
    socket.on(
        SOCKET_EVENTS.ORDER_PREPARED,
        safeHandler(async (order) => {
            await Promise.all([
                io
                    .to(`contractor_${order.canteenId}`)
                    .emit(SOCKET_EVENTS.ORDER_PREPARED, order),
                sendOrderPreparedSMS({
                    to: order.studentInfo.phoneNumber,
                    orderId: order._id,
                }),
            ]);
        })
    );

    // 🔹 ORDER PICKED UP
    socket.on(
        SOCKET_EVENTS.ORDER_PICKEDUP,
        safeHandler(async (order) => {
            await Promise.all([
                io
                    .to(`student_${order.studentId}`)
                    .to(`contractor_${order.canteenId}`)
                    .emit(SOCKET_EVENTS.ORDER_PICKEDUP, order),
                // sendOrderPickedUpSMS({
                //     to: order.studentInfo.phoneNumber,
                //     orderId: order._id,
                // }),
            ]);
        })
    );
}

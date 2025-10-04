import { app } from './app.js';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { CORS_OPTIONS } from './Constants/index.js';
import {
    deleteSocketId,
    addSocketId,
    addPreparedItem,
    sendOrderPickedUpSMS,
    sendOrderPlacedSMS,
    sendOrderPreparedSMS,
    sendOrderRejectedSMS,
    addPickedUpItem,
} from './Utils/index.js';

const http = createServer(app);
const io = new Server(http, { cors: CORS_OPTIONS });

io.on('connection', async (socket) => {
    try {
        const { userId, canteenId, role } = socket.handshake.auth;
        console.log('[USER CONNECTED] ', socket.id);

        // Event Listeners

        socket.on('newOrder', async (order) => {
            order.items.forEach((i) => {
                i.id = i._id;
            });
            await Promise.all([
                io
                    .to(`contractor_${order.canteenId}`)
                    .to(`staff_${order.canteenId}`)
                    .emit('newOrder', order),
                sendOrderPlacedSMS({
                    to: order.studentInfo.phoneNumber,
                    orderId: order._id,
                }),
            ]);
        });

        socket.on('itemPrepared', async ({ itemId, order }) => {
            await Promise.all([
                io
                    .to(`contractor_${order.canteenId}`)
                    .to(`staff_${order.canteenId}`)
                    .to(`student_${order.studentId}`)
                    .emit('itemPrepared', {
                        itemId,
                        orderId: order._id,
                        stuId: order.studentId,
                    }),
                addPreparedItem({ itemId, orderId: order._id }),
            ]);
        });

        socket.on('itemPickedUp', async ({ itemId, order }) => {
            await Promise.all([
                io
                    .to(`contractor_${order.canteenId}`)
                    .to(`student_${order.studentId}`)
                    .emit('itemPickedUp', {
                        itemId,
                        orderId: order._id,
                        stuId: order.studentId,
                    }),
                addPickedUpItem({ itemId, orderId: order._id }),
            ]);
        });

        socket.on('orderRejected', async (order) => {
            await Promise.all([
                io
                    .to(`student_${order.studentId}`)
                    .to(`contractor_${order.canteenId}`)
                    .to(`staff_${order.canteenId}`)
                    .emit('orderRejected', order),
                sendOrderRejectedSMS({
                    to: order.studentInfo.phoneNumber,
                    orderId: order._id,
                }),
            ]);
        });

        socket.on('orderPrepared', async (order) => {
            await Promise.all([
                io
                    .to(`contractor_${order.canteenId}`)
                    .emit('orderPrepared', order),
                sendOrderPreparedSMS({
                    to: order.studentInfo.phoneNumber,
                    orderId: order._id,
                }),
            ]);
        });

        socket.on('orderPickedUp', async (order) => {
            await Promise.all([
                io
                    .to(`student_${order.studentId}`)
                    .to(`contractor_${order.canteenId}`)
                    .emit('orderPickedUp', order),
                sendOrderPickedUpSMS({
                    to: order.studentInfo.phoneNumber,
                    orderId: order._id,
                }),
            ]);
        });

        socket.on('disconnect', async () => {
            console.log('[USER DISCONNECTED] ', socket.id);

            // delete the socket id from redis
            let room;
            switch (role) {
                case 'student':
                    room = `student_${userId}`;
                    break;
                case 'contractor':
                    room = `contractor_${canteenId}`;
                    break;
                default:
                    room = `staff_${canteenId}`;
                    break;
            }
            await socket.leave(room);
            await deleteSocketId(room, socket.id);
            console.log(
                `[REMOVED FROM REDIS] ${role === 'student' ? userId : canteenId}`
            );
        });

        // store its socket id in redis
        let room;
        switch (role) {
            case 'student':
                room = `student_${userId}`;
                break;
            case 'contractor':
                room = `contractor_${canteenId}`;
                break;
            default:
                room = `staff_${canteenId}`;
                break;
        }

        await addSocketId(room, socket.id);
        await socket.join(room);

        console.log(
            `[ADDED TO REDIS] ${role === 'student' ? userId : canteenId}`
        );
    } catch (err) {
        console.error('[SOCKET ERROR] ', err);
        process.exit(1);
    }
});

export { io, http };

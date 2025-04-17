import { app } from './app.js';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { CORS_OPTIONS } from './Constants/index.js';
import { deleteSocketId, addSocketId } from './Utils/index.js';
import { sendSMS } from './sms.js';

const http = createServer(app);
const io = new Server(http, { cors: CORS_OPTIONS });

io.on('connection', async (socket) => {
    const { userId, canteenId, role } = socket.handshake.auth;

    console.log('a user connected:', socket.id);

    // store its socket id in cache (redis)
    try {
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
        socket.join(room);
        await addSocketId(room, socket.id);
        console.log(
            `socket id of user ${role === 'student' ? userId : canteenId} stored in cache.`
        );
    } catch (err) {
        return console.error("Error store user's socket id in cache: ", err);
    }

    // EVENT LISTENERS

    socket.on('newOrder', async (order) => {
        io.to(`contractor_${canteenId}`)
            .to(`staff_${canteenId}`)
            .emit('newOrder', order);

        sendSMS({
            to: order.studentInfo.phoneNumber,
            text: 'Your Order is placed and will be begin preparing soon',
            link: process.env.FRONTEND_URL + `/orders/${order.studentId}`,
        });
    });

    socket.on('orderRejected', async (order) => {
        io.to(`student_${order.studentId}`)
            .to(`staff_${canteenId}`)
            .to(`contractor_${canteenId}`)
            .emit('orderRejected', order);

        sendSMS({
            to: order.studentInfo.phoneNumber,
            text: 'Your Order has been rejected',
            link: process.env.FRONTEND_URL + `/orders/${order.studentId}`,
        });
    });

    socket.on('orderPrepared', async (order) => {
        io.to(`student_${order.studentId}`)
            .to(`contractor_${canteenId}`)
            .to(`staff_${canteenId}`)
            .emit('orderPrepared', order);

        sendSMS({
            to: order.studentInfo.phoneNumber,
            text: 'Your Order is ready for pickup',
            link: process.env.FRONTEND_URL + `/orders/${order.studentId}`,
        });
    });

    socket.on('orderPickedUp', async (order) => {
        io.to(`contractor_${canteenId}`)
            .to(`staff_${canteenId}`)
            .to(`student_${order.studentId}`)
            .emit('orderPickedUp', order);

        sendSMS({
            to: order.studentInfo.phoneNumber,
            text: 'Your Order has been picked up',
            link: process.env.FRONTEND_URL + `/orders/${order.studentId}`,
        });
    });

    socket.on('itemPrepared', async ({ itemId, orderId }) => {
        io.to(`contractor_${canteenId}`)
            .to(`staff_${canteenId}`)
            .emit('itemPrepared', { itemId, orderId });
    });

    socket.on('disconnect', async () => {
        console.log('a user disconnected:', socket.id);

        // delete the socket id from cache (redis)
        try {
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
            await deleteSocketId(room, socket.id);
            console.log(
                `socket id of user ${role === 'student' ? userId : canteenId} deleted from cache.`
            );
        } catch (err) {
            return console.error(
                "Error deleting user's socket id from cache: ",
                err
            );
        }
    });
});

export { io, http };

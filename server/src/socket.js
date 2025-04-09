import { app } from './app.js';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { CORS_OPTIONS } from './Constants/options.js';
import { getSocketId, deleteSocketId, setSocketId } from './Utils/index.js';
import { sendSMS } from './sms.js';

const http = createServer(app);
const io = new Server(http, { cors: CORS_OPTIONS });

io.on('connection', async (socket) => {
    const { userId, canteenId, role } = socket.handshake.auth;

    console.log('a user connected:', socket.id);

    // store its socket id in cache (redis)
    try {
        switch (role) {
            case 'student':
                await setSocketId(userId, socket);
                break;
            case 'contractor':
                await setSocketId(canteenId, socket);
                break;
            default:
                await setSocketId('staff' + canteenId, socket);
                break;
        }
        console.log(
            `socket id of user ${role === 'student' ? userId : canteenId} stored in cache.`
        );
    } catch (err) {
        return console.error("Error store user's socket id in cache: ", err);
    }

    // EVENT LISTENERS

    // new order => notify canteen
    socket.on('newOrder', async (order) => {
        const [contrSocketId, staffSocketId] = await Promise.all([
            getSocketId(order.canteenId),
            getSocketId('staff' + order.canteenId),
        ]);
        socket.to(contrSocketId).emit('newOrder', order);
        socket.to(staffSocketId).emit('newOrder', order);
        sendSMS({
            to: order.studentInfo.phoneNumber,
            text: 'Your Order is placed and will be begin preparing soon',
            link: process.env.FRONTEND_URL + `/orders/${order.studentId}`,
        });
    });

    // new order => notify canteen
    socket.on('itemPrepared', async ({ itemId, orderId, canteenId }) => {
        const [contrSocketId, staffSocketId] = await Promise.all([
            getSocketId(canteenId),
            getSocketId('staff' + canteenId),
        ]);
        socket.to(contrSocketId).emit('itemPrepared', { itemId, orderId });
        io.to(staffSocketId).emit('itemPrepared', { itemId, orderId }); // to send event to itself use io instead of socket
    });

    // order rejected => notify student
    socket.on('orderRejected', async (order) => {
        const socketId = await getSocketId(order.studentId);
        socket.to(socketId).emit('orderRejected', order);
        sendSMS({
            to: order.studentInfo.phoneNumber,
            text: 'Your Order has been rejected',
            link: process.env.FRONTEND_URL + `/orders/${order.studentId}`,
        });
    });

    // order prepared  => notify student
    socket.on('orderPrepared', async (order) => {
        const [studentSocketId, contrSocketId] = await Promise.all([
            getSocketId(order.studentId),
            getSocketId(order.canteenId),
        ]);
        io.to(contrSocketId).emit('orderPrepared', order); // to send event to itself use io instead of socket
        socket.to(studentSocketId).emit('orderPrepared', order);
        sendSMS({
            to: order.studentInfo.phoneNumber,
            text: 'Your Order is ready for pickup',
            link: process.env.FRONTEND_URL + `/orders/${order.studentId}`,
        });
    });

    // order picked up => notify student
    socket.on('orderPickedUp', async (order) => {
        const [studentSocketId, staffSocketId, contrSocketId] =
            await Promise.all([
                getSocketId(order.studentId),
                getSocketId('staff' + order.canteenId),
                getSocketId(order.canteenId),
            ]);
        io.to(contrSocketId).emit('orderPickedUp', order); // to send event to itself use io instead of socket
        socket.to(staffSocketId).emit('orderPickedUp', order);
        socket.to(studentSocketId).emit('orderPickedUp', order);
        sendSMS({
            to: order.studentInfo.phoneNumber,
            text: 'Your Order has been picked up',
            link: process.env.FRONTEND_URL + `/orders/${order.studentId}`,
        });
    });

    socket.on('disconnect', async () => {
        console.log('a user disconnected:', socket.id);

        // delete the socket id from cache (redis)
        try {
            switch (role) {
                case 'student':
                    await deleteSocketId(userId);
                    break;
                case 'contractor':
                    await deleteSocketId(canteenId);
                    break;
                default:
                    await deleteSocketId('staff' + canteenId);
                    break;
            }
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

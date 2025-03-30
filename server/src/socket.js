import { app } from './app.js';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { CORS_OPTIONS } from './Constants/options.js';
import { getSocketId, deleteSocketId, setSocketId } from './Utils/index.js';

const http = createServer(app);
const io = new Server(http, { cors: CORS_OPTIONS });

io.on('connection', async (socket) => {
    const userId = socket.handshake.auth.userId;

    console.log('a user connected:', socket.id);

    // store its socket id in cache (redis)
    try {
        await setSocketId(userId, socket);
        console.log(`socket id of user ${userId} stored in cache.`);
    } catch (err) {
        return console.error("Error store user's socket id in cache: ", err);
    }

    // EVENT LISTENERS

    // new order => notify canteen
    socket.on('newOrder', async (order) => {
        const socketId = await getSocketId(order.canteenId);
        socket.to(socketId).emit('newOrder', order);
    });

    // order rejected => notify student
    socket.on('orderRejected', async (order) => {
        const socketId = await getSocketId(order.studentId);
        socket.to(socketId).emit('orderRejected', order);
    });

    // order prepared  => notify student
    socket.on('orderPrepared', async (order) => {
        const socketId = await getSocketId(order.studentId);
        socket.to(socketId).emit('orderPrepared', order);
    });

    // order picked up => notify student
    socket.on('orderPickedUp', async (order) => {
        const socketId = await getSocketId(order.studentId);
        socket.to(socketId).emit('orderPickedUp', order);
    });

    socket.on('disconnect', async () => {
        console.log('a user disconnected:', socket.id);

        // delete the socket id from cache (redis)
        try {
            await deleteSocketId(userId);
            console.log(`socket id of user ${userId} deleted from cache.`);
        } catch (err) {
            return console.error(
                "Error deleting user's socket id from cache: ",
                err
            );
        }
    });
});

export { io, http };

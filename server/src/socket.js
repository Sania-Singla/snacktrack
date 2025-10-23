import { app } from './app.js';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { CORS_OPTIONS } from './Constants/index.js';
import { registerItemEvents } from './Socket/item.events.js';
import { joinRoom, leaveRoom } from './Socket/room.events.js';

export const http = createServer(app);
export const io = new Server(http, { cors: CORS_OPTIONS });

io.on('connection', async (socket) => {
    const { userId, canteenId, role } = socket.handshake.auth;
    await joinRoom(socket, { userId, canteenId, role });

    registerItemEvents(io, socket);

    socket.on('disconnect', async () => {
        await leaveRoom(socket, { userId, canteenId, role });
    });
});

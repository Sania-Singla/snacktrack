import { redisClient } from '../server.js';

export async function joinRoom(socket, { userId, canteenId, role }) {
    switch (role) {
        case 'student': {
            await redisClient.setEx(userId.toString(), 3600, socket.id);
            console.log(`[USER JOINED] ${userId} (${socket.id})`);
            break;
        }
        case 'contractor': {
            const room = `contractor_${canteenId}`;
            await redisClient.sAdd(room, socket.id);
            await socket.join(room);
            console.log(`[USER JOINED] ${room} (${socket.id})`);
            break;
        }
        case 'kiosk': {
            const room = `kiosk_${canteenId}`;
            await redisClient.sAdd(room, socket.id);
            await socket.join(room);
            console.log(`[KIOSK JOINED] ${room} (${socket.id})`);
            break;
        }
        default: {
            console.log(`[UNKNOWN ROLE] ${role} (${socket.id})`);
        }
    }
}

export async function leaveRoom(socket, { userId, canteenId, role }) {
    switch (role) {
        case 'student': {
            await redisClient.del(userId.toString());
            console.log(`[USER LEFT] ${userId} (${socket.id})`);
            break;
        }
        case 'contractor': {
            const room = `contractor_${canteenId}`;
            await redisClient.sRem(room, socket.id);
            await socket.leave(room);
            console.log(`[USER LEFT] ${room} (${socket.id})`);
            break;
        }
        case 'kiosk': {
            const room = `kiosk_${canteenId}`;
            await redisClient.sRem(room, socket.id);
            await socket.leave(room);
            console.log(`[KIOSK LEFT] ${room} (${socket.id})`);
            break;
        }
        default: {
            console.log(`[UNKNOWN ROLE] ${role} (${socket.id})`);
        }
    }
}

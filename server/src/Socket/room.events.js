import { redisClient } from '../server.js';

export async function joinRoom(socket, { userId, canteenId, role }) {
    switch (role) {
        case 'student': {
            await redisClient.setEx(userId.toString(), 3600, socket.id);
            console.log(`[USER JOINED] ${userId} (${socket.id})`);
            break;
        }
        case 'contractor': {
            await redisClient.setEx(canteenId.toString(), 43200, socket.id);
            console.log(`[USER JOINED] ${canteenId} (${socket.id})`);
            break;
        }
        case 'kiosk': {
            await redisClient.setEx(`kiosk_${canteenId}`, 43200, socket.id);
            console.log(`[KIOSK JOINED] kiosk_${canteenId} (${socket.id})`);
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
            await redisClient.del(canteenId.toString());
            console.log(`[USER LEFT] ${canteenId} (${socket.id})`);
            break;
        }
        case 'kiosk': {
            await redisClient.del(`kiosk_${canteenId}`);
            console.log(`[KIOSK LEFT] kiosk_${canteenId} (${socket.id})`);
            break;
        }
        default: {
            console.log(`[UNKNOWN ROLE] ${role} (${socket.id})`);
        }
    }
}

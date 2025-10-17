import { addSocketId, deleteSocketId } from '../Utils/index.js';

export async function joinRoom(socket, { userId, canteenId, role }) {
    let room;
    switch (role) {
        case 'student':
            room = `student_${userId}`;
            break;
        default:
            room = `contractor_${canteenId}`;
            break;
    }

    await addSocketId(room, socket.id);
    await socket.join(room);

    console.log(`[ROOM JOINED] ${room} (${socket.id})`);
    return room;
}

export async function leaveRoom(socket, { userId, canteenId, role }) {
    let room;
    switch (role) {
        case 'student':
            room = `student_${userId}`;
            break;
        default:
            room = `contractor_${canteenId}`;
            break;
    }

    await deleteSocketId(room, socket.id);
    await socket.leave(room);

    console.log(`[ROOM LEFT] ${room} (${socket.id})`);
}

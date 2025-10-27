import { useContext, createContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useUserContext } from './User.Context';

const SocketContext = createContext();

const SocketContextProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user } = useUserContext();

    function connectSocket() {
        if (socket) disconnectSocket();
        if (!user || user.role === 'admin') return;

        const socketInstance = io(import.meta.env.VITE_BACKEND_URL, {
            withCredentials: true,
            auth: {
                userId: user._id || null,
                canteenId: user.canteenId,
                role: user.role,
            },
        });

        socketInstance.on('connect', () => {
            // console.log('socket connected. SocketId: ', socketInstance.id);
            setSocket(socketInstance);
        });

        socketInstance.on('connect_error', (err) => {
            // console.error('Socket connection error:', err);
            setSocket(null);
        });

        socketInstance.on('error', (err) => {
            // console.error('Socket error:', err);
            setSocket(null);
        });

        return socketInstance;
    }

    function disconnectSocket() {
        if (socket) {
            // console.log('socket disconnected');
            socket.disconnect();
            setSocket(null);
        }
    }

    useEffect(() => {
        user ? connectSocket() : disconnectSocket();
        return () => disconnectSocket();
    }, [user?._id]);

    return (
        <SocketContext.Provider
            value={{ socket, connectSocket, disconnectSocket }}
        >
            {children}
        </SocketContext.Provider>
    );
};

const useSocketContext = () => useContext(SocketContext);

export { useSocketContext, SocketContextProvider };

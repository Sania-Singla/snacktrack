import { useContext, createContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useOrderContext } from './Order.Context';
import { useUserContext } from './User.Context';

const SocketContext = createContext();

const SocketContextProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user } = useUserContext();
    const { setStudentOrders, setPendingOrders } = useOrderContext();

    function connectSocket() {
        if (!user || socket) return;

        const socketInstance = io(import.meta.env.VITE_BACKEND_URL, {
            withCredentials: true,
            auth: {
                userId: user._id,
                canteenId: user.canteenId,
                role: user.role,
            },
        });

        socketInstance.on('connect', () => {
            console.log('socket connected. SocketId: ', socketInstance.id);
            setSocket(socketInstance);
        });

        // Error Handling
        socketInstance.on('connect_error', (err) => {
            console.error('Socket connection error:', err);
            console.log(err);
        });

        socketInstance.on('error', (err) => {
            console.error('Socket error:', err);
            console.log(err);
        });

        // Events
        socketInstance.on('orderRejected', (order) => {
            setStudentOrders((prev) =>
                prev.map((o) =>
                    o._id === order._id ? { ...o, status: 'Rejected' } : o
                )
            );
        });

        socketInstance.on('orderPrepared', (order) => {
            setStudentOrders((prev) =>
                prev.map((o) =>
                    o._id === order._id ? { ...o, status: 'Prepared' } : o
                )
            );
        });

        socketInstance.on('orderPickedUp', (order) => {
            setStudentOrders((prev) =>
                prev.map((o) =>
                    o._id === order._id ? { ...o, status: 'PickedUp' } : o
                )
            );
        });

        socketInstance.on('newOrder', (order) => {
            setPendingOrders((prev) => [order, ...prev]);
        });

        return socketInstance; // optional
    }

    function disconnectSocket() {
        if (socket) {
            console.log('socket disconnecting...');
            socket.disconnect(); // will set socket = null implicitly
            setSocket(null);
        }
    }

    useEffect(() => {
        user ? connectSocket() : disconnectSocket();
        return () => disconnectSocket();
    }, [user]);

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

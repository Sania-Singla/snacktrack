import { useContext, createContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useOrderContext } from './Order.Context';
import { useUserContext } from './User.Context';
import { playSound } from '../Utils';

const SocketContext = createContext();

const SocketContextProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user } = useUserContext();
    const {
        setStudentOrders,
        setPendingOrders,
        preparedCount,
        setPreparedCount,
    } = useOrderContext();

    function updateOrderStatus(order, status) {
        setStudentOrders((prev) =>
            prev.map((o) => (o._id === order._id ? { ...o, status } : o))
        );
        setPendingOrders((prev) => prev.filter((o) => o._id !== order._id));
    }

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
        });

        socketInstance.on('error', (err) => {
            console.error('Socket error:', err);
        });

        // Events

        socketInstance.on('newOrder', async (order) => {
            setPendingOrders((prev) => prev.concat(order));
            await playSound();
        });

        socketInstance.on('orderRejected', (order) => {
            updateOrderStatus(order, 'Rejected');
        });

        socketInstance.on('orderPrepared', (order) => {
            updateOrderStatus(order, 'Prepared');
        });

        socketInstance.on('orderPickedUp', (order) => {
            setStudentOrders((prev) =>
                prev.map((o) =>
                    o._id === order._id ? { ...o, status: 'PickedUp' } : o
                )
            );

            const updatedCount = Object.fromEntries(
                Object.entries(preparedCount).filter(
                    ([key]) => !key.endsWith(order._id)
                )
            );

            localStorage.setItem('preparedCount', JSON.stringify(updatedCount));
            setPreparedCount(updatedCount);
        });

        socketInstance.on('itemPrepared', ({ itemId, orderId }) => {
            const itemKey = `${itemId}-${orderId}`;
            setPreparedCount((prev) => {
                const newCount = (prev[itemKey] || 0) + 1;
                const newState = { ...prev, [itemKey]: newCount };
                localStorage.setItem('preparedCount', JSON.stringify(newState));
                return newState;
            });
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

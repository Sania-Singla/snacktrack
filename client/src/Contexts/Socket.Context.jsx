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
        setPreparedCount,
        setKitchenOrders,
    } = useOrderContext();

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
            setKitchenOrders((prev) => prev.concat(order));
            await playSound();
        });

        socketInstance.on('orderRejected', (order) => {
            setPendingOrders((prev) => prev.filter((o) => o._id !== order._id));
            setKitchenOrders((prev) => prev.filter((o) => o._id !== order._id));
            setStudentOrders((prev) =>
                prev.map((o) =>
                    o._id === order._id ? { ...o, status: 'Rejected' } : o
                )
            );
        });

        socketInstance.on('orderPrepared', (order) => {
            setPendingOrders((prev) => prev.filter((o) => o._id !== order._id));
            setKitchenOrders((prev) => prev.filter((o) => o._id !== order._id));
            setStudentOrders((prev) =>
                prev.map((o) =>
                    o._id === order._id ? { ...o, status: 'Prepared' } : o
                )
            );
        });

        socketInstance.on('orderPickedUp', (order) => {
            setPendingOrders((prev) => prev.filter((o) => o._id !== order._id));
            setKitchenOrders((prev) => prev.filter((o) => o._id !== order._id));
            setStudentOrders((prev) =>
                prev.map((o) =>
                    o._id === order._id ? { ...o, status: 'PickedUp' } : o
                )
            );

            setPreparedCount((prev) => {
                const newCount = { ...prev };
                Object.keys(newCount).forEach((key) => {
                    if (key.endsWith('-' + order._id)) {
                        delete newCount[key];
                    }
                });
                localStorage.setItem('preparedCount', JSON.stringify(newCount));
                return newCount;
            });
        });

        socketInstance.on('itemPrepared', ({ itemId, orderId }) => {
            // set the item to local storage
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

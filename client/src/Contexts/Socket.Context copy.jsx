// import { useContext, createContext, useState, useEffect } from 'react';
// import { io } from 'socket.io-client';
// import { useOrderContext } from './Order.Context';
// import { useUserContext } from './User.Context';
// import { playSound } from '../Utils';
// import { orderService } from '../Services';

// const SocketContext = createContext();

// const SocketContextProvider = ({ children }) => {
//     const [socket, setSocket] = useState(null);
//     const { user } = useUserContext();
//     const {
//         setStudentOrders,
//         setPendingOrders,
//         setPreparedCount,
//         setKitchenOrders,
//         setStats,
//     } = useOrderContext();

//     function connectSocket() {
//         if (!user || socket?.role !== 'staff') return;
//         else {
//             disconnectSocket(); // because we can shift to staff role without login so we need to manually disconnect the previous socket to connect as a new staff socket
//         }

//         const socketInstance = io(import.meta.env.VITE_BACKEND_URL, {
//             withCredentials: true,
//             auth: {
//                 userId: user._id,
//                 canteenId: user.canteenId,
//                 role: user.role,
//             },
//         });

//         socketInstance.on('connect', () => {
//             console.log('socket connected. SocketId: ', socketInstance.id);
//             setSocket(socketInstance);
//         });

//         // Error Handling
//         socketInstance.on('connect_error', (err) => {
//             console.error('Socket connection error:', err);
//         });

//         socketInstance.on('error', (err) => {
//             console.error('Socket error:', err);
//         });

//         // Events

//         socketInstance.on('newOrder', async (order) => {
//             await playSound();
//             const hasSnacks = order.items.some((item) => item.type === 'Snack');
//             if (!hasSnacks) {
//                 // no snack, so the order is prepared we assume (all packaged items)
//                 setStats((prev) => ({
//                     ...prev,
//                     total: prev.total + 1,
//                     prepared: prev.prepared + 1,
//                 }));
//                 setStudentOrders((prev) =>
//                     prev.map((o) =>
//                         o._id === order._id ? { ...o, status: 'Prepared' } : o
//                     )
//                 );
//             } else {
//                 setPendingOrders((prev) => prev.concat(order));
//                 setKitchenOrders((prev) =>
//                     prev.concat({
//                         ...order,
//                         items: order.items.filter((i) => i.type === 'Snack'),
//                     })
//                 );
//                 setStats((prev) => ({
//                     ...prev,
//                     total: prev.total + 1,
//                     pending: prev.pending + 1,
//                 }));
//             }
//         });

//         socketInstance.on('orderRejected', (order) => {
//             setKitchenOrders((prev) => prev.filter((o) => o._id !== order._id));
//             setStudentOrders((prev) =>
//                 prev.map((o) =>
//                     o._id === order._id ? { ...o, status: 'Rejected' } : o
//                 )
//             );
//             setStats((prev) => ({
//                 ...prev,
//                 pending: prev.pending - 1,
//                 rejected: prev.rejected + 1,
//             }));
//         });

//         socketInstance.on('orderPrepared', (order) => {
//             setKitchenOrders((prev) => prev.filter((o) => o._id !== order._id));
//             setStudentOrders((prev) =>
//                 prev.map((o) =>
//                     o._id === order._id ? { ...o, status: 'Prepared' } : o
//                 )
//             );
//             setStats((prev) => ({
//                 ...prev,
//                 pending: prev.pending - 1,
//                 prepared: prev.prepared + 1,
//             }));
//         });

//         socketInstance.on('orderPickedUp', (order) => {
//             setKitchenOrders((prev) => prev.filter((o) => o._id !== order._id));
//             setStudentOrders((prev) =>
//                 prev.map((o) =>
//                     o._id === order._id ? { ...o, status: 'PickedUp' } : o
//                 )
//             );
//             setStats((prev) => ({
//                 ...prev,
//                 prepared: prev.prepared - 1,
//                 pickedUp: prev.pickedUp + 1,
//             }));

//             setPreparedCount((prev) => {
//                 const newCount = { ...prev };
//                 Object.keys(newCount).forEach((key) => {
//                     if (key.endsWith('-' + order._id)) {
//                         delete newCount[key];
//                     }
//                 });
//                 localStorage.setItem('preparedCount', JSON.stringify(newCount));
//                 return newCount;
//             });
//         });

//         socketInstance.on('itemPrepared', async ({ itemId, orderId }) => {
//             let isPrepared = false;

//             setPreparedCount((prev) => {
//                 const itemKey = `${itemId}-${orderId}`;
//                 const newCount = (prev[itemKey] || 0) + 1;

//                 const updatedCount = { ...prev, [itemKey]: newCount };
//                 localStorage.setItem(
//                     'preparedCount',
//                     JSON.stringify(updatedCount)
//                 );

//                 // Now use the updatedCount to check orders
//                 setPendingOrders((prev) =>
//                     prev.map((o) => {
//                         if (o._id === orderId && o.status === 'Pending') {
//                             const allSnackItemsPrepared = o.items
//                                 .filter((i) => i.type === 'Snack')
//                                 .every((i) => {
//                                     const key = `${i._id}-${orderId}`;
//                                     const prepared = updatedCount[key] || 0;
//                                     return prepared >= i.quantity;
//                                 });

//                             if (allSnackItemsPrepared) {
//                                 isPrepared = true;
//                                 socketInstance.emit('orderPrepared', o);

//                                 return { ...o, status: 'Prepared' };
//                             }
//                         }
//                         return o;
//                     })
//                 );

//                 return updatedCount;
//             });

//             if (isPrepared) {
//                 await orderService.updateOrderStatus(orderId, 'Prepared');
//             }
//         });

//         return socketInstance;
//     }

//     function disconnectSocket() {
//         if (socket) {
//             console.log('socket disconnecting...');
//             socket.disconnect();
//             setSocket(null);
//         }
//     }

//     useEffect(() => {
//         user ? connectSocket() : disconnectSocket();
//         return () => disconnectSocket();
//     }, [user]);

//     return (
//         <SocketContext.Provider
//             value={{ socket, connectSocket, disconnectSocket }}
//         >
//             {children}
//         </SocketContext.Provider>
//     );
// };

// const useSocketContext = () => useContext(SocketContext);

// export { useSocketContext, SocketContextProvider };

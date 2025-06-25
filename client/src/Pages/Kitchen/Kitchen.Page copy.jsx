// import { useEffect, useState, useMemo } from 'react';
// import { orderService } from '../../Services';
// import { Link, useNavigate } from 'react-router-dom';
// import { Button, VerifyKitchenKeyPage } from '../../Components';
// import { icons } from '../../Assets/icons';
// import toast from 'react-hot-toast';
// import {
//     useOrderContext,
//     useSocketContext,
//     useUserContext,
// } from '../../Contexts';
// import { LOGO } from '../../Constants/constants';

// export default function KitchenPage() {
//     const { kitchenOrders, setKitchenOrders, preparedCount, setPreparedCount } =
//         useOrderContext();
//     const navigate = useNavigate();
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(false);
//     const { setUser, user } = useUserContext();
//     const { socket } = useSocketContext();

//     useEffect(() => {
//         (async function () {
//             try {
//                 setKitchenOrders([]);
//                 setPreparedCount(
//                     JSON.parse(localStorage.getItem('preparedCount')) || {}
//                 );
//                 const res =
//                     await orderService.verifyKitchenKeyAndGetKitchenOrders();
//                 if (res) {
//                     if (res.message) setError(true);
//                     else {
//                         setKitchenOrders(res.orders);
//                         setUser({
//                             canteenId: res.canteenId,
//                             userId: null,
//                             role: 'staff',
//                         });
//                     }
//                 }
//                 setLoading(false);
//             } catch (err) {
//                 navigate('/server-error');
//             }
//         })();
//     }, []);

//     function handleMinus(itemId, orderId) {
//         toast.success('Marked as prepared', { duration: 1000 });
//         socket.emit('itemPrepared', { itemId, orderId });
//     }

//     const itemSummary = useMemo(() => {
//         const summary = {};

//         kitchenOrders.forEach(({ items, _id: orderId }) => {
//             items.forEach(
//                 ({ quantity, name, _id: itemId, specialInstructions }) => {
//                     const itemKey = `${itemId}-${orderId}`;
//                     const count = preparedCount[itemKey] || 0;
//                     const remaining = quantity - count;

//                     if (remaining > 0) {
//                         if (!summary[name]) summary[name] = [];

//                         summary[name].push({
//                             quantity: remaining,
//                             itemId,
//                             orderId,
//                             specialInstructions,
//                         });
//                     }
//                 }
//             );
//         });

//         return summary;
//     }, [kitchenOrders, preparedCount]);

//     return loading ? (
//         <div className="flex justify-center py-12">
//             <div className="size-[25px] fill-[#4977ec] dark:text-[#a2bdff]">
//                 {icons.loading}
//             </div>
//         </div>
//     ) : error ? (
//         <VerifyKitchenKeyPage setError={setError} />
//     ) : (
//         // Orders
//         <div className="min-h-screen bg-gray-100 p-4 md:p-6">
//             <div className="max-w-7xl mx-auto">
//                 <div className="flex justify-between items-center mb-6">
//                     {/* logo */}
//                     <Link
//                         to={'/'}
//                         className="flex items-center justify-center gap-3 text-nowrap font-medium text-lg"
//                     >
//                         <div className="overflow-hidden rounded-full size-[35px] shadow-sm">
//                             <img
//                                 src={LOGO}
//                                 alt="Snack Track Logo"
//                                 className="object-cover size-full hover:brightness-95"
//                             />
//                         </div>
//                         <p className="hover:text-[#4977ec]">SnackTrack</p>
//                     </Link>
//                     <p className="bg-[#4977ec]/10 text-[#4977ec] px-3 py-1 rounded-full text-sm font-medium">
//                         {kitchenOrders.length}{' '}
//                         {kitchenOrders.length === 1 ? 'Order' : 'Orders'}
//                     </p>
//                 </div>

//                 {/* Item Summary Column */}
//                 <div className="bg-white rounded-xl shadow-md overflow-hidden">
//                     <div className="p-4 border-b border-gray-200 text-center">
//                         <h2 className="text-xl font-semibold text-gray-800">
//                             Kitchen Summary
//                         </h2>
//                         <p className="text-sm text-gray-500">
//                             Aggregated items for preparation
//                         </p>
//                     </div>
//                     <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-3 overflow-y-auto">
//                         {Object.entries(itemSummary).length > 0 ? (
//                             Object.entries(itemSummary).map(
//                                 ([itemName, itemList]) => {
//                                     const firstItem = itemList[0]; // Always take the topmost (earliest) order
//                                     const totalQuantity = itemList.reduce(
//                                         (sum, item) => sum + item.quantity,
//                                         0
//                                     );

//                                     const instructionsSummary = {};
//                                     itemList.forEach((item) => {
//                                         if (item.specialInstructions) {
//                                             instructionsSummary[
//                                                 item.specialInstructions
//                                             ] =
//                                                 (instructionsSummary[
//                                                     item.specialInstructions
//                                                 ] || 0) + item.quantity;
//                                         }
//                                     });

//                                     return (
//                                         <div
//                                             key={itemName}
//                                             className="bg-gray-50 rounded-lg p-3 h-fit border border-gray-200 hover:border-[#4977ec]/50 transition-colors"
//                                         >
//                                             <div className="flex flex-col gap-2">
//                                                 <div className="flex items-center justify-between">
//                                                     <h3 className="font-semibold text-gray-900 text-lg truncate max-w-[120px]">
//                                                         {itemName}
//                                                     </h3>
//                                                     <div className="bg-[#4977ec]/10 text-[#4977ec] flex items-center justify-center size-[30px] rounded-full font-bold text-sm">
//                                                         {totalQuantity}
//                                                     </div>
//                                                 </div>

//                                                 {Object.keys(
//                                                     instructionsSummary
//                                                 ).length > 0 && (
//                                                     <div className="mt-1 space-y-2">
//                                                         <div className="text-sm font-medium text-gray-500 border-b pb-1">
//                                                             Special Requests:
//                                                         </div>
//                                                         {Object.entries(
//                                                             instructionsSummary
//                                                         ).map(
//                                                             ([
//                                                                 instruction,
//                                                                 count,
//                                                             ]) => (
//                                                                 <div
//                                                                     key={
//                                                                         instruction
//                                                                     }
//                                                                     className="flex items-center gap-2 bg-red-50/50 p-2 rounded border border-red-100"
//                                                                 >
//                                                                     <span className="bg-red-100 text-red-800 p-1 rounded-full text-xs font-bold size-[24px] text-center">
//                                                                         {count}
//                                                                     </span>
//                                                                     <span className="text-xs mb-[5px] text-gray-700 flex-1">
//                                                                         {
//                                                                             instruction
//                                                                         }
//                                                                     </span>
//                                                                 </div>
//                                                             )
//                                                         )}
//                                                     </div>
//                                                 )}
//                                             </div>

//                                             {user?.role !== 'contractor' && (
//                                                 <div className="flex items-center justify-center mt-3">
//                                                     <Button
//                                                         className="rounded-full size-8 text-3xl pb-[6px] flex items-center justify-center text-white bg-[#4977ec] hover:bg-[#3b62c2] shadow-md"
//                                                         onClick={() =>
//                                                             handleMinus(
//                                                                 firstItem.itemId,
//                                                                 firstItem.orderId
//                                                             )
//                                                         }
//                                                         btnText="-"
//                                                     />
//                                                 </div>
//                                             )}
//                                         </div>
//                                     );
//                                 }
//                             )
//                         ) : (
//                             <div className="col-span-full p-4 text-center text-gray-500">
//                                 No items summary available
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

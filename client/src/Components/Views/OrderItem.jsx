import { icons } from '../../Assets/icons';
import { SNACK_PLACEHOLDER_IMAGE, SOCKET_EVENTS } from '../../Constants';
import { useSocketContext } from '../../Contexts';
import { Button } from '..';
import { useState } from 'react';

export default function OrderItem({ item, order, type = 'static' }) {
    const { socket } = useSocketContext();
    const { canteenId, status, studentId } = order;
    const { name, image, specialInstructions, quantity, price } = item;
    const [disabledOne, setDisabledOne] = useState(false);
    const [disabledTwo, setDisabledTwo] = useState(false);

    const itemStatus =
        type === 'static' ? (
            <div>
                {null}
                {/* {item.prepared && !item.pickedUp && (
                    <span className="flex items-center gap-1 text-xs bg-green-50 rounded-full font-medium border-[0.01rem] border-green-300 w-fit px-2 text-green-600">
                        Ready
                    </span>
                )} */}
            </div>
        ) : (
            <div>
                {null}
                {/* {item.prepared ? (
                    !item.pickedUp && (
                        <Button
                            disabled={disabledOne}
                            btnText="Taken"
                            className="rounded-sm text-white bg-[#4977ec] hover:bg-[#3b62c2] text-xs font-medium text-center w-12 h-5.5"
                            onClick={() => {
                                setDisabledOne(true);
                                socket.emit(SOCKET_EVENTS.ITEM_PICKEDUP, {
                                    itemId: item.id,
                                    orderId: order._id,
                                    studentId,
                                    canteenId,
                                });
                            }}
                        />
                    )
                ) : (
                    <Button
                        disabled={disabledTwo}
                        btnText="Ready"
                        className="rounded-sm text-white bg-green-600 hover:bg-green-700 text-xs font-medium text-center w-12 h-5.5"
                        onClick={() => {
                            setDisabledTwo(true);
                            socket.emit(SOCKET_EVENTS.ITEM_PREPARED, {
                                itemId: item.id,
                                orderId: order._id,
                                studentId,
                                canteenId,
                            });
                        }}
                    />
                )} */}
            </div>
        );

    return (
        <div
            key={item.id}
            className={`relative p-3 border-b-1 border-b-gray-100 ${
                (status === 'Pending' || status === 'Prepared') && item.pickedUp
                    ? 'opacity-60'
                    : ''
            }`}
        >
            {/* ✅ */}
            {(status === 'Pending' || status === 'Prepared') &&
                item.pickedUp && (
                    <div className="absolute inset-0 bg-[#caffdd] border-green-300 border-[0.01rem] flex items-center h-full w-full justify-center -z-10">
                        <div className="fill-green-600 size-6 p-1">
                            {icons.check}
                        </div>
                    </div>
                )}

            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="size-7.5 bg-gray-50 rounded-md border-1 border-gray-300 overflow-hidden flex items-center justify-center">
                        {item.type === 'Snack' ? (
                            <img
                                src={image || SNACK_PLACEHOLDER_IMAGE}
                                alt={`${name} image`}
                                className="object-cover size-full"
                            />
                        ) : (
                            <div className="size-4 stroke-gray-300">
                                {icons.soda}
                            </div>
                        )}
                    </div>
                    <div className="pb-1">
                        <h3 className="text-sm font-medium text-gray-800">
                            <span>{name}</span>
                        </h3>
                        <p className="text-gray-600 text-xs">Qty: {quantity}</p>
                    </div>
                </div>
                <div className="flex flex-col items-end justify-between gap-1">
                    <div className="text-sm font-semibold text-gray-900">
                        ₹{(price * quantity).toFixed(2)}
                    </div>

                    {status === 'Pending' && itemStatus}
                </div>
            </div>

            {specialInstructions && (
                <p className="ml-11 pt-1 italic text-xs text-red-600">
                    <span className="font-medium">Note - </span>
                    {specialInstructions}
                </p>
            )}
        </div>
    );
}

import { ExtraChargeUpdate } from '..';

export default function OrderTotal({
    order,
    type = 'static',
    rejecting = false,
}) {
    const { amount, extraCharges } = order;

    const extraChrgs =
        type === 'static' ? (
            <span>₹{extraCharges.toFixed(2)}</span>
        ) : (
            <ExtraChargeUpdate order={order} rejecting={rejecting} />
        );

    return (
        <div className="p-3">
            <div className="flex justify-between text-[0.8rem] text-gray-600">
                <span>Subtotal</span>
                <span>₹{amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[0.8rem] text-gray-600 mt-1">
                <span>Extra Charges</span>
                {extraChrgs}
            </div>
            <div className="flex justify-between font-medium text-gray-900 mt-2">
                <span>Total</span>
                <span>₹{(amount + extraCharges).toFixed(2)}</span>
            </div>
        </div>
    );
}

import { Button } from '..';
import { useState } from 'react';
import { icons } from '../../Assets/icons';
import { useUserContext } from '../../Contexts';
import { orderService } from '../../Services';
import toast from 'react-hot-toast';
import { checkTokenExpired } from '../../Utils';

export default function ExtraChargeUpdate({ order, rejecting = false }) {
    const [extraChgs, setExtraChgs] = useState(order.extraCharges || 0);
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(true);
    const { setUser } = useUserContext();

    async function handleExtraChargesUpdate() {
        try {
            setLoading(true);
            let chgs = parseFloat(extraChgs) || 0;
            const res = await orderService.updateExtraCharges({
                orderId: order._id,
                extraCharges: chgs,
            });
            if (res && res.message === 'extra charges updated successfully') {
                toast.success('Extra charges updated successfully');
            } else if (res && res.message === 'too late') {
                toast.error('Too Late');
            } else checkTokenExpired(res, setUser);
        } catch (err) {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setDisabled(true);
            setLoading(false);
        }
    }

    return (
        <div className="flex gap-1 items-center">
            <input
                onChange={(e) => {
                    const value = e.target.value.trim();
                    if (/^\d*\.?\d*$/.test(value)) {
                        setExtraChgs(value);
                    }
                    setDisabled(!value);
                }}
                value={extraChgs}
                type="text"
                name="extraCharges"
                placeholder="₹ 0"
                className="border-1 text-sm h-6 border-[#4977ec] rounded-sm px-1.5 w-12 focus:outline-2 focus:outline-[#4977ec]"
            />
            <Button
                btnText={
                    loading ? (
                        <div className="size-4 fill-[#4977ec] dark:text-[#a2bdff]">
                            {icons.loading}
                        </div>
                    ) : (
                        'Save'
                    )
                }
                disabled={disabled || loading || rejecting}
                className="w-11 h-6 text-white flex items-center justify-center bg-[#4977ec] hover:bg-[#3b62c2] rounded-sm text-xs"
                onClick={handleExtraChargesUpdate}
            />
        </div>
    );
}

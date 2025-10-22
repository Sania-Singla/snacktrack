import { useState } from 'react';
import { icons } from '../Assets/icons';
import { Completed, Pending, Rejected, Stats, Kitchen } from '../Components';
import { useOrderContext } from '../Contexts';
import { Resizable } from 're-resizable';
import { motion } from 'framer-motion';

export default function TodayOrdersPage() {
    const { statusFilter } = useOrderContext();
    const [showOrderSide, setShowOrderSide] = useState(true);

    return (
        <div className="flex gap-4 h-full">
            <Resizable
                defaultSize={{ width: '30%' }}
                enable={showOrderSide ? { right: true } : {}}
                className={`${showOrderSide ? '' : 'hidden'} min-w-[40%] max-w-[50%] lg:min-w-[30%] h-full border-r border-gray-200 pr-4`}
                style={{ width: showOrderSide ? undefined : 0 }}
            >
                <div className="h-full overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-semibold text-gray-900">
                            Orders
                        </h1>
                        <div
                            onClick={() => setShowOrderSide(false)}
                            className="size-8 rounded-full border-1 border-gray-200 flex items-center justify-center bg-white cursor-pointer"
                        >
                            <div className="size-3.5 fill-gray-800 rotate-90">
                                {icons.arrowDown}
                            </div>
                        </div>
                    </div>

                    <div className="mb-4">
                        <Stats />
                    </div>

                    {statusFilter === 'Pending' && <Pending />}
                    {statusFilter === 'PickedUp' && <Completed />}
                    {statusFilter === 'Rejected' && <Rejected />}
                </div>
            </Resizable>

            <div className="flex-1 h-full">
                <Kitchen
                    setShowOrderSide={setShowOrderSide}
                    showOrderSide={showOrderSide}
                />
            </div>
        </div>
    );
}

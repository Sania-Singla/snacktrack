import { useState } from 'react';
import { icons } from '../Assets/icons';
import {
    Completed,
    Pending,
    Prepared,
    Rejected,
    Stats,
    Kitchen,
    Dropdown,
} from '../Components';
import { useOrderContext } from '../Contexts';
import { Resizable } from 're-resizable';

export default function TodayOrdersPage() {
    const { statusFilter, setStatusFilter } = useOrderContext();
    const [showOrderSide, setShowOrderSide] = useState(true);

    return (
        <div className="flex gap-4 h-full min-h-[calc(100vh-4rem)]">
            <Resizable
                defaultSize={{ width: '25%' }}
                enable={showOrderSide ? { right: true } : {}}
                className={`${showOrderSide ? 'min-w-[40%] max-w-[50%] lg:min-w-[25%] border-r border-gray-200 pr-4' : 'hidden'} h-full`}
                style={{ width: showOrderSide ? undefined : 0 }}
            >
                <div className="h-full overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-semibold text-gray-900">
                            Orders
                        </h1>
                        {/* <div
                            onClick={() => setShowOrderSide(false)}
                            className="size-8 rounded-full border-1 border-gray-200 flex items-center justify-center bg-white cursor-pointer"
                        >
                            <div className="size-3.5 fill-gray-800 rotate-90">
                                {icons.arrowDown}
                            </div>
                        </div> */}
                        <div>
                            <Dropdown
                                options={[
                                    { label: 'Prepared', value: 'Prepared' },
                                    { label: 'Pending', value: 'Pending' },
                                    { label: 'Completed', value: 'PickedUp' },
                                    { label: 'Rejected', value: 'Rejected' },
                                ]}
                                className="py-1 text-sm px-3 border-1 border-gray-200 text-[#4977ec] font-medium"
                                setValue={setStatusFilter}
                                size="sm"
                            />
                        </div>
                    </div>

                    {/* <div className="mb-4">
                        <Stats />
                    </div> */}

                    {statusFilter === 'Pending' && <Pending />}
                    {statusFilter === 'Prepared' && <Prepared />}
                    {statusFilter === 'PickedUp' && <Completed />}
                    {statusFilter === 'Rejected' && <Rejected />}
                </div>
            </Resizable>

            <div className="flex-1 h-full min-h-[calc(100vh-4rem)]">
                <Kitchen
                    setShowOrderSide={setShowOrderSide}
                    showOrderSide={showOrderSide}
                />
            </div>
        </div>
    );
}

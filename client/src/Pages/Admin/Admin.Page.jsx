import { useEffect, useMemo, useState } from 'react';
import { adminService } from '../../Services';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../Components';
import { usePopupContext } from '../../Contexts';
import { LOGO_SVG, USER_PLACEHOLDER_IMAGE } from '../../Constants';
import toast from 'react-hot-toast';

export default function AdminPage() {
    const [canteens, setCanteens] = useState([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const { setShowPopup, setPopupInfo } = usePopupContext();

    useEffect(() => {
        (async function () {
            try {
                const res = await adminService.getContractors();
                if (res) setCanteens(res);
                setLoading(false);
            } catch (err) {
                toast.error('Something went wrong. Please try again.');
            }
        })();
    }, []);

    const canteenElements = useMemo(() => {
        return canteens.map((canteen) => (
            <div
                key={canteen._id}
                className="bg-white rounded-lg shadow-xs border-1 border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
                {/* Hostel Details */}
                <div className="flex items-center justify-between gap-4 mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {canteen.hostelName}
                    </h2>
                    <p className="text-nowrap text-[#4977ec] font-medium">
                        {canteen.hostelType} {canteen.hostelNumber}
                    </p>
                </div>

                {/* Contractor Details */}
                <div className="relative flex justify-between">
                    <div className="flex items-center gap-4">
                        <div>
                            <div className="size-14 rounded-full overflow-hidden">
                                <img
                                    src={USER_PLACEHOLDER_IMAGE}
                                    alt="user placeholder image"
                                    className="size-full object-cover"
                                />
                            </div>
                        </div>
                        <div className="space-y-1 pb-1">
                            <p className="font-semibold text-gray-900">
                                {canteen.contractor.fullName}
                            </p>
                            <p className="text-xs text-gray-700">
                                <span className="font-medium">Email:</span>{' '}
                                {canteen.contractor.email}
                            </p>
                            <p className="text-xs  text-gray-700">
                                <span className="font-medium">Phone:</span>{' '}
                                {canteen.contractor.phoneNumber}
                            </p>
                        </div>
                    </div>

                    <div className="self-end">
                        <Button
                            btnText="Details"
                            className="bg-[#4977ec] px-2 py-1 rounded-md shadow-xs text-white"
                            onClick={() => {
                                setShowPopup(true);
                                setPopupInfo({
                                    type: 'proceedAsAdmin',
                                    canteenId: canteen._id,
                                });
                            }}
                        />
                    </div>
                </div>
            </div>
        ));
    });

    return (
        !loading && (
            <div className="min-h-screen bg-gray-50 p-6">
                <div>
                    <section className="w-full mb-8 p-8 bg-white rounded-lg shadow-sm flex justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-900">
                                Admin Dashboard
                            </h1>
                            <p className="mt-4 text-gray-500 max-w-3xl">
                                Welcome to the Admin Dashboard, Here you can
                                manage Resources efficiently.
                            </p>
                        </div>
                        <div className="size-20">
                            <img
                                src={LOGO_SVG}
                                alt="logo svg"
                                className="size-full object-cover"
                            />
                        </div>
                    </section>

                    <div className="flex justify-center w-full mb-8">
                        <Button
                            className="w-fit bg-[#4977ec] text-white px-4 py-2 rounded-md hover:bg-[#3b62c2]"
                            btnText="Register New Canteen"
                            onClick={() => navigate('new-canteen')}
                        />
                    </div>

                    {/* Canteen Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {canteenElements}
                    </div>
                </div>
            </div>
        )
    );
}

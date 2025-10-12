import { useEffect, useMemo, useState } from 'react';
import { adminService } from '../../Services';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../Components';
import { icons } from '../../Assets/icons';
import { usePopupContext } from '../../Contexts';
import { LOGO } from '../../Constants/constants';

export default function AdminPage() {
    const [canteens, setCanteens] = useState([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const { setShowPopup, setPopupInfo } = usePopupContext();

    useEffect(() => {
        (async function () {
            try {
                console.log(1);

                const res = await adminService.getContractors();
                console.log(res);
                if (res) {
                    setCanteens(res);
                }
                setLoading(false);
            } catch (err) {
                navigate('/server-error');
            }
        })();
    }, []);

    const canteenElements = useMemo(() => {
        return canteens.map((canteen) => (
            <div
                key={canteen._id}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
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
                                    src={canteen.contractor.avatar}
                                    alt={canteen.contractor.fullName}
                                    className="size-full object-cover"
                                />
                            </div>
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">
                                {canteen.contractor.fullName}
                            </p>
                            <p className="text-[12px] text-gray-700">
                                <span className="font-medium">Email:</span>{' '}
                                {canteen.contractor.email}
                            </p>
                            <p className="text-[12px]  text-gray-700">
                                <span className="font-medium">Phone:</span>{' '}
                                {canteen.contractor.phoneNumber}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2 flex-col h-fit self-end">
                        <Button
                            btnText={
                                <div className="size-4 fill-none stroke-black group-hover:stroke-[#4977ec]">
                                    {icons.editUnfilled}
                                </div>
                            }
                            className="bg-[#f0efef] p-2 group rounded-full shadow-sm hover:bg-[#ebeaea]"
                            onClick={() => {
                                setShowPopup(true);
                                setPopupInfo({
                                    type: 'editContractor',
                                    contractor: canteen.contractor,
                                });
                            }}
                        />
                        <Button
                            btnText={
                                <div className="size-[14px] group-hover:fill-[#4977ec]">
                                    {icons.delete}
                                </div>
                            }
                            className="bg-[#f0efef] p-2 group rounded-full shadow-sm hover:bg-[#ebeaea]"
                            onClick={() => {
                                setShowPopup(true);
                                setPopupInfo({
                                    type: 'newContractor',
                                    contractor: canteen.contractor,
                                    autoFill: false,
                                });
                            }}
                        />
                    </div>
                </div>
            </div>
        ));
    });

    return loading ? (
        <div>loading...</div>
    ) : (
        <div className="min-h-screen bg-gray-50 p-6">
            <div>
                <section className="w-full bg-white shadow-sm mb-8 rounded-xl p-8 md:px-12 flex justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                            Admin Dashboard
                        </h1>
                        <p className="mt-4 text-gray-500 max-w-3xl">
                            Welcome to the Admin Dashboard, Here you can manage
                            Resources efficiently.
                        </p>
                    </div>
                    <img src={LOGO} alt="logo svg" className="size-20" />
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
    );
}

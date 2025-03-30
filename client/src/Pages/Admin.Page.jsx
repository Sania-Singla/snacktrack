import { useEffect, useState } from 'react';
import { userService } from '../Services';
import { useNavigate } from 'react-router-dom';
import { Button } from '../Components';
import { icons } from '../Assets/icons';
import toast from 'react-hot-toast';

export default function AdminPage() {
    const [canteens, setCanteens] = useState([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [key, setKey] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [showKey, setShowKey] = useState(false);

    useEffect(() => {
        (async function getCanteens() {
            try {
                const res = await userService.getContractors();
                if (res) {
                    if (res.message) setError(true);
                    else setCanteens(res);
                }
            } catch (err) {
                navigate('/server-error');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const verifyKey = async () => {
        if (!key) return;
        setVerifying(true);
        try {
            const res = await userService.getContractors(key);
            if (res && !res.message) {
                setError(false);
                setCanteens(res);
            } else toast.error('Please Enter a Valid Key');
        } catch (err) {
            navigate('/server-error');
        } finally {
            setVerifying(false);
        }
    };

    const canteenElements = canteens.map((canteen) => (
        <div
            key={canteen._id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
            {/* Hostel Details */}
            <div className="flex items-center justify-between gap-4 mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                    {canteen.hostelName}
                </h2>
                <p className="text-nowrap font-medium text-gray-800">
                    {canteen.hostelType} {canteen.hostelNumber}
                </p>
            </div>

            {/* Contractor Details */}
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
                    <p className="text-lg font-semibold text-gray-900">
                        {canteen.contractor.fullName}
                    </p>
                    <p className="text-sm text-gray-700">
                        <span className="font-medium">Email:</span>{' '}
                        {canteen.contractor.email}
                    </p>
                    <p className="text-sm  text-gray-700">
                        <span className="font-medium">Phone:</span>{' '}
                        {canteen.contractor.phoneNumber}
                    </p>
                </div>
            </div>
        </div>
    ));

    return loading ? (
        <div>loading...</div>
    ) : error ? (
        // verify admin key
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="sm:px-8 drop-shadow-md relative w-[350px] sm:w-[450px] transition-all duration-300 bg-white rounded-xl overflow-hidden text-black p-5 flex flex-col items-center justify-center gap-4">
                <p className="text-2xl font-bold text-center mb-2">
                    Verify Admin Key
                </p>
                <p className="text-[15px] text-gray-600 text-center mb-3">
                    Enter the Admin Secret key to navigate to control panel
                </p>

                <div className="relative flex items-center w-full justify-center mb-3">
                    <input
                        type={showKey ? 'text' : 'password'}
                        value={key}
                        autoFocus
                        onChange={(e) => setKey(e.target.value)}
                        className="w-full text-xl text-center border-[0.01rem] indent-3 pr-12 rounded-md py-[5px] border-gray-600 focus:border-[#4977ec] focus:outline-none"
                    />
                    <div
                        onClick={() => setShowKey((prev) => !prev)}
                        className="size-[20px] absolute right-3 top-[50%] transform translate-y-[-50%] cursor-pointer fill-gray-700"
                    >
                        {showKey ? icons.eyeOff : icons.eye}
                    </div>
                </div>

                <Button
                    btnText={
                        verifying ? (
                            <div className="flex items-center justify-center w-full">
                                <div className="size-5 fill-[#4977ec] dark:text-[#a2bdff]">
                                    {icons.loading}
                                </div>
                            </div>
                        ) : (
                            'Verify'
                        )
                    }
                    onClick={verifyKey}
                    disabled={!key}
                    className="text-white rounded-md py-2 h-[40px] flex items-center justify-center text-lg w-full bg-[#4977ec] hover:bg-[#3b62c2]"
                />
            </div>
        </div>
    ) : (
        // Admin Dashboard
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <section className="w-full bg-white shadow-md mb-8 rounded-xl py-10 px-8 md:px-16">
                    <h1 className="text-4xl font-bold text-gray-900">
                        Admin Dashboard
                    </h1>
                    <p className="mt-4 text-lg text-gray-700 max-w-3xl">
                        Welcome to the Admin Dashboard. Here you can manage
                        canteens and contractors efficiently.
                    </p>
                </section>

                <div className="flex justify-center w-full mb-8">
                    <Button
                        className="w-fit bg-[#4977ec] text-white text-lg px-6 py-3 rounded-lg font-semibold hover:bg-[#3b62c2]"
                        btnText="Register New Canteen"
                        onClick={() => navigate('new-canteen')}
                    />
                </div>

                {/* Canteen Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {canteenElements}
                </div>
            </div>
        </div>
    );
}

import { useUserContext } from '../../Contexts';
import { getRollNo } from '../../Utils';

export default function UpdateAccountDetailsStudent() {
    const { user } = useUserContext();

    return (
        <div className="w-full p-2">
            <div className="rounded-md border-1 border-gray-200 shadow-xs flex flex-col sm:flex-row bg-white py-7 px-6 sm:gap-14">
                <div className="w-full">
                    <h3 className="text-xl font-semibold">Personal Details</h3>
                    <p className="mt-4 text-gray-600">
                        To edit your personal details, please contact your
                        hostel officials.
                    </p>
                </div>

                <div className="w-full max-w-[600px] mt-4">
                    <div className="flex flex-col gap-4 text-gray-900">
                        <p>
                            <span className="font-medium">Name: </span>
                            <span>{user.fullName}</span>
                        </p>
                        <p>
                            <span className="font-medium">Roll No: </span>
                            <span>{getRollNo(user.userName)}</span>
                        </p>
                        <p>
                            <span className="font-medium">Email: </span>
                            <span>{user.email}</span>
                        </p>
                        <p>
                            <span className="font-medium">PhoneNumber: </span>
                            <span>{user.phoneNumber}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

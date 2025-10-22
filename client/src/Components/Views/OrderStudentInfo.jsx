import { USER_PLACEHOLDER_IMAGE } from '../../Constants';
import { getRollNo } from '../../Utils';

export default function OrderStudentInfo({ studentInfo }) {
    return (
        <div className="flex items-center gap-3">
            <div className="size-7.5 rounded-full overflow-hidden shadow-xs">
                <img
                    src={USER_PLACEHOLDER_IMAGE}
                    alt="user placeholder image"
                    className="size-full object-cover"
                />
            </div>

            <div className="pb-1">
                <h3 className="flex items-center gap-1">
                    <span className="text-[15px] font-medium text-gray-800 truncate">
                        {studentInfo.fullName}
                    </span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-600">
                        Roll No: {getRollNo(studentInfo.userName)}
                    </span>
                </h3>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                    {studentInfo.phoneNumber}
                </div>
            </div>
        </div>
    );
}

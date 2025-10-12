import { useSearchParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';

export default function CalendarFilter({ queryParamName = 'date', month }) {
    const [searchParams, setSearchParams] = useSearchParams();
    const selectedDateParam = searchParams.get(queryParamName);
    const selectedDate = selectedDateParam ? new Date(selectedDateParam) : null;

    // Calculate the min and max dates for the given month
    const year = new Date().getFullYear();
    const minDate = new Date(year, month - 1, 1); // First day
    const maxDate = new Date(year, month, 0); // Last day

    const handleDateChange = (date) => {
        const params = new URLSearchParams(searchParams);
        if (date) {
            const localDate = date.toLocaleDateString('en-CA'); // 'YYYY-MM-DD' local date string
            params.set(queryParamName, localDate);
        } else {
            params.delete(queryParamName);
        }
        setSearchParams(params);
    };

    return (
        <div>
            <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                placeholderText="Select date"
                className="py-1.5 rounded-lg pr-4 w-[120px] text-center shadow-xs bg-white text-gray-800 border border-gray-200 outline-none focus:ring-1 focus:ring-[#4977ec]"
                dateFormat="yyyy-MM-dd"
                minDate={minDate}
                maxDate={maxDate}
                isClearable
                clearButtonClassName="text-gray-500 hover:text-gray-700"
            />
        </div>
    );
}

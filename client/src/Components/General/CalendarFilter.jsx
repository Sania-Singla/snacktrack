import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useOrderContext } from '../../Contexts';
import { icons } from '../../Assets/icons';

export default function CalendarFilter({ maxDate = new Date() }) {
    const { dateFilter, setDateFilter } = useOrderContext();
    const year = new Date().getFullYear();
    const minDate = new Date(year, 0, 1);

    return (
        <DatePicker
            selected={dateFilter ? new Date(dateFilter) : null}
            onChange={(date) =>
                setDateFilter(date?.toLocaleDateString('en-CA') || null)
            }
            className="flex items-center justify-center"
            placeholderText="DD/MM/YYYY"
            dateFormat="dd/MM/yyyy"
            minDate={minDate}
            maxDate={maxDate}
            isClearable={false}
            showMonthDropdown
            dropdownMode="select"
            todayButton="Today"
            customInput={
                <div className="bg-white cursor-pointer rounded-md p-1 border-1 border-gray-200">
                    <div className="size-5 fill-gray-700">{icons.calender}</div>
                </div>
            }
        />
    );
}

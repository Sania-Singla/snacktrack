import { useState, useEffect, useRef } from 'react';
import { icons } from '../../Assets/icons';

export default function OrderDropdown({
    options,
    defaultOption = '',
    onChange,
}) {
    const [selectedValue, setSelectedValue] = useState(defaultOption);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleOptionClick = (value) => {
        onChange(value);
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            window.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('touchstart', handleClickOutside);
        }

        return () => {
            window.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isDropdownOpen]);

    return (
        <div className="w-full mb-0">
            <div className="relative inline-block w-full" ref={dropdownRef}>
                {/* Dropdown Button */}
                <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full font-medium flex items-center gap-2 cursor-pointer justify-between bg-[#e0e0e010] border-[0.01rem] border-gray-500 hover:border-gray-400 px-2 py-1 rounded-md text-[14px] text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#4977ec] focus:border-[#4977ec] transition-all duration-200"
                >
                    {options.find((opt) => opt.value === selectedValue)?.label}
                    <div
                        className={`size-[10px] fill-gray-800 transition-all duration-300 ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`}
                    >
                        {icons.arrowDown}
                    </div>
                </button>

                {/* Dropdown Options */}
                {isDropdownOpen && (
                    <div className="text-[14px] text-nowrap absolute z-10 mt-2 w-full cursor-pointer bg-white border border-gray-300 rounded-md shadow-sm overflow-hidden max-h-[200px] overflow-y-auto">
                        {options.map(
                            (option) =>
                                option.value !== defaultOption && (
                                    <div
                                        key={option.label}
                                        onClick={() =>
                                            handleOptionClick(option.value)
                                        }
                                        className="px-2 py-1 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                                    >
                                        {option.label}
                                    </div>
                                )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

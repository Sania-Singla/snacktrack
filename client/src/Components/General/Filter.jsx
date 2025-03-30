import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { icons } from '../../Assets/icons';

export default function Filter({
    options,
    defaultOption,
    queryParamName = 'filter',
}) {
    const [searchParams, setSearchParams] = useSearchParams();
    const filter = searchParams.get(queryParamName) || defaultOption;
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleOptionClick = (value) => {
        const params = new URLSearchParams(searchParams);
        if (value === defaultOption) {
            params.delete(queryParamName); // Remove query param if default option is selected
        } else {
            params.set(queryParamName, value); // Set query param for valid selections
        }
        setSearchParams(params);
        setIsDropdownOpen(false);
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
        <div className="w-fit">
            <div className="relative inline-block w-full" ref={dropdownRef}>
                {/* Dropdown Button */}
                <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex items-center cursor-pointer justify-between gap-2 bg-white border border-gray-300 hover:border-gray-400 px-3 py-2 rounded-lg shadow-sm text-lg text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#4977ec] focus:border-[#4977ec] transition-all duration-200"
                >
                    <div className="flex items-center gap-[10px]">
                        {options.find((opt) => opt.value === filter)?.icon && (
                            <div className="size-[16px] fill-gray-900">
                                {
                                    options.find((opt) => opt.value === filter)
                                        ?.icon
                                }
                            </div>
                        )}
                        <span>
                            {options.find((opt) => opt.value === filter)?.label}
                        </span>
                    </div>
                    <div
                        className={`size-[14px] fill-gray-800 transition-all duration-300 ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`}
                    >
                        {icons.arrowDown}
                    </div>
                </button>

                {/* Dropdown Options */}
                {isDropdownOpen && (
                    <div className="absolute z-10 mt-2 w-full cursor-pointer bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
                        {options.map(
                            (option) =>
                                option.value !== filter && (
                                    <div
                                        key={option.value}
                                        onClick={() =>
                                            handleOptionClick(option.value)
                                        }
                                        className="flex items-center gap-[10px] px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                                    >
                                        {option.icon && (
                                            <div className="size-[16px] fill-gray-900">
                                                {option.icon}
                                            </div>
                                        )}
                                        <span>{option.label}</span>
                                    </div>
                                )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

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
    const buttonRef = useRef(null);
    const [dropdownWidth, setDropdownWidth] = useState('auto');

    const handleOptionClick = (value) => {
        const params = new URLSearchParams(searchParams);
        if (value === defaultOption) {
            params.delete(queryParamName);
        } else {
            params.set(queryParamName, value);
        }
        setSearchParams(params);
        setIsDropdownOpen(false);
    };

    // Calculate dropdown width based on button width
    useEffect(() => {
        if (buttonRef.current) {
            setDropdownWidth(`${buttonRef.current.offsetWidth}px`);
        }
    }, []);

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

    // Find current selected option
    const selectedOption = options.find((opt) => opt.value == filter); // losse comparison for month (number)

    return (
        <div>
            <div className="relative w-full" ref={dropdownRef}>
                {/* Dropdown Button */}
                <button
                    ref={buttonRef}
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex cursor-pointer items-center justify-between w-full gap-2 bg-white border border-gray-200 hover:border-gray-400 px-3 py-2 rounded-lg shadow-xs text-lg text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#4977ec] focus:border-[#4977ec] transition-all duration-200 min-w-[120px]"
                >
                    <div className="flex items-center gap-2 overflow-hidden">
                        {selectedOption?.icon && (
                            <div className="shrink-0 size-4 fill-gray-900">
                                {selectedOption.icon}
                            </div>
                        )}
                        <span className="truncate">
                            {selectedOption?.label}
                        </span>
                    </div>
                    <div
                        className={`shrink-0 size-3 fill-gray-800 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : 'rotate-0'}`}
                    >
                        {icons.arrowDown}
                    </div>
                </button>

                {/* Dropdown Options */}
                {isDropdownOpen && (
                    <div
                        className="absolute z-1 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden w-full"
                        style={{
                            width: dropdownWidth,
                            minWidth: 'max-content',
                        }}
                    >
                        {options.map(
                            (option) =>
                                option.value !== filter && (
                                    <div
                                        key={option.value}
                                        onClick={() =>
                                            handleOptionClick(option.value)
                                        }
                                        className="cursor-pointer flex items-center gap-2.5 px-3 py-2 hover:bg-gray-100 transition-colors duration-200"
                                    >
                                        {option.icon && (
                                            <div className="shrink-0 size-4 fill-gray-900">
                                                {option.icon}
                                            </div>
                                        )}
                                        <span className="truncate">
                                            {option.label}
                                        </span>
                                    </div>
                                )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

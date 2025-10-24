import { useState } from 'react';
import { icons } from '../../Assets/icons';
import {
    Listbox,
    ListboxButton,
    ListboxOption,
    ListboxOptions,
} from '@headlessui/react';

export default function Dropdown({
    options,
    setValue,
    defaultVal = '',
    className = '',
    size = 'md',
}) {
    const [selectedValue, setSelectedValue] = useState(
        defaultVal || options[0].value
    );
    const [isOpen, setIsOpen] = useState(false);

    const handleClick = (value) => {
        setValue(value);
        setSelectedValue(value);
        setIsOpen(false);
    };

    return (
        <div className="w-full relative">
            <Listbox value={selectedValue} onChange={handleClick}>
                <ListboxButton
                    onClick={() => setIsOpen((prev) => !prev)}
                    className={`${className ? className : 'px-2.5 py-2'} border-1 border-gray-300 overflow-auto w-full flex justify-between items-center gap-4 rounded-md bg-white cursor-pointer`}
                >
                    <span className="w-fit">
                        {options.find((o) => o.value === selectedValue)?.label}
                    </span>
                    <div
                        className={`size-2.5 fill-gray-800 transition-all duration-100 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                    >
                        {icons.arrowDown}
                    </div>
                </ListboxButton>

                <ListboxOptions className="focus:outline-none absolute z-[100] w-full mt-1 border border-gray-400 rounded-md bg-white shadow-xs max-h-[400px] overflow-y-auto">
                    {options.map((opt) => (
                        <ListboxOption
                            key={opt.label}
                            value={opt.value}
                            className={({ focus }) =>
                                `${size === 'md' ? 'px-3 py-2' : 'text-sm py-1 px-2'} cursor-pointer w-full text-gray-800 transition-colors duration-200 ${
                                    focus ? 'bg-gray-100' : ''
                                }`
                            }
                        >
                            {({ selected }) => (
                                <span className={selected ? 'font-medium' : ''}>
                                    {opt.label}
                                </span>
                            )}
                        </ListboxOption>
                    ))}
                </ListboxOptions>
            </Listbox>
        </div>
    );
}

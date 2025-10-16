import { useState, useEffect, useRef } from 'react';
import { icons } from '../../Assets/icons';
import { useSearchContext } from '../../Contexts';
import { useLocation, useSearchParams } from 'react-router-dom';

export default function Searchbar() {
    const { search, setSearch } = useSearchContext();
    const [placeholder, setPlaceholder] = useState('');
    const [isTyping, setIsTyping] = useState(true);
    const typingIntervalRef = useRef(null);
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

    const snackNames = [
        'Search "Chips"',
        'Search "Chocolate"',
        'Search "Poha"',
        'Search "Popcorn"',
        'Search "Burger"',
        'Search "Samosa"',
        'Search "Tikki"',
    ];

    useEffect(() => {
        const urlSearch = searchParams.get('search') || '';
        setSearch(urlSearch);
    }, [location.search]);

    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        if (search) {
            params.set('search', search);
        } else {
            params.delete('search');
        }
        setSearchParams(params);
    }, [search]);

    const startTypingEffect = () => {
        let currentIndex = 0,
            currentText = '',
            isDeleting = false;

        (function type() {
            const currentSnack = snackNames[currentIndex];

            if (isDeleting) {
                currentText = currentSnack.substring(0, currentText.length - 1);
            } else {
                currentText = currentSnack.substring(0, currentText.length + 1);
            }

            setPlaceholder(currentText);

            if (!isDeleting && currentText === currentSnack) {
                setTimeout(() => (isDeleting = true), 1000);
            } else if (isDeleting && currentText === '') {
                isDeleting = false;
                currentIndex = (currentIndex + 1) % snackNames.length;
            }

            typingIntervalRef.current = setTimeout(type, 200);
        })();
    };

    useEffect(() => {
        if (isTyping) startTypingEffect();

        return () => {
            if (typingIntervalRef.current) {
                clearTimeout(typingIntervalRef.current);
            }
        };
    }, [isTyping]);

    const handleFocus = () => {
        setIsTyping(false);
        if (typingIntervalRef.current) clearTimeout(typingIntervalRef.current);
        setPlaceholder('');
    };

    const handleBlur = () => {
        if (!search) {
            setIsTyping(true);
            startTypingEffect();
        }
    };

    return (
        <div className="w-full group shadow-sm rounded-lg relative overflow-hidden">
            <input
                type="text"
                placeholder={
                    location.pathname === '/' ? placeholder : 'Search here'
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className="w-full bg-white border-transparent border-[0.1rem] indent-8 px-[5px] py-1 text-black font-normal placeholder:font-light placeholder:text-gray-500 outline-none focus:border-[#4977ec] transition-all duration-100"
            />
            <div className="size-4 fill-gray-400 group-focus-within:fill-[#4977ec] absolute top-[50%] translate-y-[-50%] left-3">
                {icons.search}
            </div>
            {search && (
                <div
                    onClick={() => {
                        setSearch('');
                        setTimeout(() => setIsTyping(true), 1000);
                    }}
                    className="hover:bg-gray-100 rounded-full absolute right-2 p-[5px] cursor-pointer top-[50%] translate-y-[-50%]"
                >
                    <div className="size-4 stroke-gray-800">{icons.cross}</div>
                </div>
            )}
        </div>
    );
}

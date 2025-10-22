import { createContext, useContext, useState } from 'react';

const SearchContext = createContext();

const SearchContextProvider = ({ children }) => {
    const [debouncedSearch, setDebouncedSearch] = useState('');

    return (
        <SearchContext.Provider value={{ debouncedSearch, setDebouncedSearch }}>
            {children}
        </SearchContext.Provider>
    );
};

const useSearchContext = () => useContext(SearchContext);

export { useSearchContext, SearchContextProvider };

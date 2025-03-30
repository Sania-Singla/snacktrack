import { useContext, createContext, useState } from 'react';

const SnackContext = createContext();

const SnackContextProvider = ({ children }) => {
    const [snacks, setSnacks] = useState([]);
    const [items, setItems] = useState([]);

    return (
        <SnackContext.Provider value={{ snacks, setSnacks, items, setItems }}>
            {children}
        </SnackContext.Provider>
    );
};

const useSnackContext = () => useContext(SnackContext);

export { useSnackContext, SnackContextProvider };

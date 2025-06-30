import { useContext, createContext, useState } from 'react';

const SnackContext = createContext();

const SnackContextProvider = ({ children }) => {
    const [items, setItems] = useState([]);
    const [itemsInfo, setItemsInfo] = useState({});

    return (
        <SnackContext.Provider
            value={{ items, setItems, itemsInfo, setItemsInfo }}
        >
            {children}
        </SnackContext.Provider>
    );
};

const useSnackContext = () => useContext(SnackContext);

export { useSnackContext, SnackContextProvider };

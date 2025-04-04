import { createContext, useContext, useState } from 'react';

const PopupContext = createContext();

const PopupContextProvider = ({ children }) => {
    const [showPopup, setShowPopup] = useState(false);
    const [popupInfo, setPopupInfo] = useState({ type: '', target: {} });

    return (
        <PopupContext.Provider
            value={{ showPopup, popupInfo, setPopupInfo, setShowPopup }}
        >
            {children}
        </PopupContext.Provider>
    );
};

const usePopupContext = () => useContext(PopupContext);

export { usePopupContext, PopupContextProvider };

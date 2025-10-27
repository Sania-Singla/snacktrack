import { createContext, useContext, useState } from 'react';

const StudentContext = createContext();

const StudentContextProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(
        JSON.parse(localStorage.getItem('cartItems')) || []
    );
    const [orderPlaced, setOrderPlaced] = useState(false);

    return (
        <StudentContext.Provider
            value={{ cartItems, setCartItems, orderPlaced, setOrderPlaced }}
        >
            {children}
        </StudentContext.Provider>
    );
};

const useStudentContext = () => useContext(StudentContext);

export { useStudentContext, StudentContextProvider };

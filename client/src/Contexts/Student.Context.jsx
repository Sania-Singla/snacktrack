import { createContext, useContext, useState } from 'react';

const StudentContext = createContext();

const StudentContextProvider = ({ children }) => {
    const [students, setStudents] = useState([]);
    const [cartItems, setCartItems] = useState(
        JSON.parse(localStorage.getItem('cartItems')) || []
    );

    return (
        <StudentContext.Provider
            value={{ students, setStudents, cartItems, setCartItems }}
        >
            {children}
        </StudentContext.Provider>
    );
};

const useStudentContext = () => useContext(StudentContext);

export { useStudentContext, StudentContextProvider };

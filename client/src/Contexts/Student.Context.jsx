import { createContext, useContext, useState } from 'react';

const StudentContext = createContext();

const StudentContextProvider = ({ children }) => {
    const [students, setStudents] = useState([]);
    const [studentsInfo, setStudentsInfo] = useState({});
    const [cartItems, setCartItems] = useState(
        JSON.parse(localStorage.getItem('cartItems')) || []
    );
    const [orderPlaced, setOrderPlaced] = useState(false);

    return (
        <StudentContext.Provider
            value={{
                students,
                setStudents,
                cartItems,
                setCartItems,
                orderPlaced,
                setOrderPlaced,
                studentsInfo,
                setStudentsInfo,
            }}
        >
            {children}
        </StudentContext.Provider>
    );
};

const useStudentContext = () => useContext(StudentContext);

export { useStudentContext, StudentContextProvider };

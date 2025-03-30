import { createContext, useContext, useState } from 'react';

const StudentContext = createContext();

const StudentContextProvider = ({ children }) => {
    const [students, setStudents] = useState([]);
    const [targetStudent, setTargetStudent] = useState({});

    return (
        <StudentContext.Provider
            value={{ students, setStudents, targetStudent, setTargetStudent }}
        >
            {children}
        </StudentContext.Provider>
    );
};

const useStudentContext = () => useContext(StudentContext);

export { useStudentContext, StudentContextProvider };

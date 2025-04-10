import { createContext, useContext, useState } from 'react';

const OrderContext = createContext();

const OrderContextProvider = ({ children }) => {
    const [studentOrders, setStudentOrders] = useState([]);
    const [pendingOrders, setPendingOrders] = useState([]);
    const [preparedCount, setPreparedCount] = useState(
        JSON.parse(localStorage.getItem('preparedCount')) || {}
    );

    return (
        <OrderContext.Provider
            value={{
                studentOrders,
                setStudentOrders,
                pendingOrders,
                setPendingOrders,
                preparedCount,
                setPreparedCount,
            }}
        >
            {children}
        </OrderContext.Provider>
    );
};

const useOrderContext = () => useContext(OrderContext);

export { useOrderContext, OrderContextProvider };

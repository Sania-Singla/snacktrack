import { createContext, useContext, useState } from 'react';

const OrderContext = createContext();

const OrderContextProvider = ({ children }) => {
    const [studentOrders, setStudentOrders] = useState([]);
    const [pendingOrders, setPendingOrders] = useState([]); // for canteen & kitchen

    return (
        <OrderContext.Provider
            value={{
                studentOrders,
                setStudentOrders,
                pendingOrders,
                setPendingOrders,
            }}
        >
            {children}
        </OrderContext.Provider>
    );
};

const useOrderContext = () => useContext(OrderContext);

export { useOrderContext, OrderContextProvider };

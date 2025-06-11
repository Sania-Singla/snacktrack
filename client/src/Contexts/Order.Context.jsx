import { createContext, useContext, useState } from 'react';

const OrderContext = createContext();

const OrderContextProvider = ({ children }) => {
    const [studentOrders, setStudentOrders] = useState([]);
    const [pendingOrders, setPendingOrders] = useState([]);
    const [stats, setStats] = useState({});
    const [kitchenOrders, setKitchenOrders] = useState([]);
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
                kitchenOrders,
                setKitchenOrders,
                preparedCount,
                setPreparedCount,
                stats,
                setStats,
            }}
        >
            {children}
        </OrderContext.Provider>
    );
};

const useOrderContext = () => useContext(OrderContext);

export { useOrderContext, OrderContextProvider };

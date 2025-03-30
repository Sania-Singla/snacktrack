import { createContext, useContext, useState } from 'react';

const OrderContext = createContext();

const OrderContextProvider = ({ children }) => {
    const [studentOrders, setStudentOrders] = useState([]);

    // for canteen & kitchen
    const [pendingOrders, setPendingOrders] = useState([]);
    const [rejectedOrders, setRejectedOrders] = useState([]);
    const [preparedOrders, setPreparedOrders] = useState([]);
    const [pickedUpOrders, setPickedUpOrders] = useState([]);

    return (
        <OrderContext.Provider
            value={{
                studentOrders,
                setStudentOrders,
                pendingOrders,
                setPendingOrders,
                rejectedOrders,
                setRejectedOrders,
                preparedOrders,
                setPreparedOrders,
                pickedUpOrders,
                setPickedUpOrders,
            }}
        >
            {children}
        </OrderContext.Provider>
    );
};

const useOrderContext = () => useContext(OrderContext);

export { useOrderContext, OrderContextProvider };

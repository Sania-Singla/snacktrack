import { createContext, useContext, useState } from 'react';

const OrderContext = createContext();

const OrderContextProvider = ({ children }) => {
    const [dateFilter, setDateFilter] = useState(
        new Date().toLocaleDateString('en-CA')
    );
    const [statusFilter, setStatusFilter] = useState('Pending');
    const [monthFilter, setMonthFilter] = useState(new Date().getMonth() + 1);
    const [stats, setStats] = useState({
        Total: 0,
        incomplete: 0, // both pending (even partially ready) and prepared
        Pending: 0,
        Prepared: 0,
        PickedUp: 0,
        Rejected: 0,
    });

    return (
        <OrderContext.Provider
            value={{
                dateFilter,
                setDateFilter,
                statusFilter,
                setStatusFilter,
                stats,
                setStats,
                monthFilter,
                setMonthFilter,
            }}
        >
            {children}
        </OrderContext.Provider>
    );
};

const useOrderContext = () => useContext(OrderContext);

export { useOrderContext, OrderContextProvider };

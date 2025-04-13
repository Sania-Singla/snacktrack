import { createContext, useContext, useState } from 'react';

const UserContext = createContext();

const UserContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [audioEnabled, setAudioEnabled] = useState(false);

    return (
        <UserContext.Provider
            value={{ user, setUser, audioEnabled, setAudioEnabled }}
        >
            {children}
        </UserContext.Provider>
    );
};

const useUserContext = () => useContext(UserContext);

export { useUserContext, UserContextProvider };

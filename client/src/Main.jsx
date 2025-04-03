import { createRoot } from 'react-dom/client';
import './Styles/index.css';

import { RouterProvider } from 'react-router-dom';
import { router } from './Router';

import {
    UserContextProvider,
    PopupContextProvider,
    SideBarContextProvider,
    SearchContextProvider,
    StudentContextProvider,
    SnackContextProvider,
    OrderContextProvider,
    SocketContextProvider,
} from './Contexts';

function Root() {
    return (
        <UserContextProvider>
            <OrderContextProvider>
                <SocketContextProvider>
                    <SnackContextProvider>
                        <StudentContextProvider>
                            <PopupContextProvider>
                                <SideBarContextProvider>
                                    <SearchContextProvider>
                                        <RouterProvider router={router} />
                                    </SearchContextProvider>
                                </SideBarContextProvider>
                            </PopupContextProvider>
                        </StudentContextProvider>
                    </SnackContextProvider>
                </SocketContextProvider>
            </OrderContextProvider>
        </UserContextProvider>
    );
}

createRoot(document.getElementById('root')).render(
    // <StrictMode>
    <Root />
    // </StrictMode>,
);

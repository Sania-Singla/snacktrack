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
                <PopupContextProvider>
                    <SocketContextProvider>
                        <SnackContextProvider>
                            <StudentContextProvider>
                                <SideBarContextProvider>
                                    <SearchContextProvider>
                                        <RouterProvider router={router} />
                                    </SearchContextProvider>
                                </SideBarContextProvider>
                            </StudentContextProvider>
                        </SnackContextProvider>
                    </SocketContextProvider>
                </PopupContextProvider>
            </OrderContextProvider>
        </UserContextProvider>
    );
}

createRoot(document.getElementById('root')).render(
    // <StrictMode>
    <Root />
    // </StrictMode>,
);

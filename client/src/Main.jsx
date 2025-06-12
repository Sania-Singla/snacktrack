import { createRoot } from 'react-dom/client';
import './Styles/index.css';
import 'react-datepicker/dist/react-datepicker.css';

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
                    <SnackContextProvider>
                        <SocketContextProvider>
                            <StudentContextProvider>
                                <SideBarContextProvider>
                                    <SearchContextProvider>
                                        <RouterProvider router={router} />
                                    </SearchContextProvider>
                                </SideBarContextProvider>
                            </StudentContextProvider>
                        </SocketContextProvider>
                    </SnackContextProvider>
                </PopupContextProvider>
            </OrderContextProvider>
        </UserContextProvider>
    );
}

createRoot(document.getElementById('root')).render(<Root />);

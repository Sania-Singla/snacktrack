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
} from './Contexts';

function Root() {
    return (
        <UserContextProvider>
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
        </UserContextProvider>
    );
}

createRoot(document.getElementById('root')).render(
    // <StrictMode>
    <Root />
    // </StrictMode>,
);

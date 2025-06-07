import App from './App';

import {
    Route,
    createBrowserRouter,
    createRoutesFromElements,
} from 'react-router-dom';

import {
    HomePage,
    LoginPage,
    RegisterStudentPage,
    SettingsPage,
    StudentsPage,
    ServerErrorPage,
    NotFoundPage,
    Redirect,
    BillsPage,
    NewUserPage,
    TodayOrdersPage,
    StudentOrdersPage,
    CartPage,
    StudentBillsPage,
    KitchenPage,
    StatisticsPage,
    AdminPage,
    RegisterCanteenPage,
} from './Pages';

import {
    UpdateAccountDetails,
    UpdatePassword,
    UpdateKitchenKey,
    Layout,
} from './Components';

export const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<App />}>
            {/* private routes */}
            <Route element={<Redirect />}>
                <Route element={<Layout />}>
                    <Route path="" element={<HomePage />} />
                    <Route path="settings" element={<SettingsPage />}>
                        <Route path="" element={<UpdateAccountDetails />} />
                        <Route path="password" element={<UpdatePassword />} />
                        <Route
                            path="kitchen-key"
                            element={<UpdateKitchenKey />}
                        />
                    </Route>
                    <Route
                        path="orders/:studentId"
                        element={<StudentOrdersPage />}
                    />
                    <Route
                        path="bills/:studentId"
                        element={<StudentBillsPage />}
                    />
                </Route>

                {/* accessable to student only */}

                <Route element={<Redirect who="student" />}>
                    {/* who => who can access the page */}
                    <Route element={<Layout />}>
                        <Route path="cart" element={<CartPage />} />
                    </Route>
                </Route>

                {/* accessable to contractor only */}

                <Route element={<Redirect who="contractor" />}>
                    <Route element={<Layout />}>
                        <Route
                            path="today-orders"
                            element={<TodayOrdersPage />}
                        />
                        <Route path="all-bills" element={<BillsPage />} />
                        <Route path="students" element={<StudentsPage />} />
                        <Route path="statistics" element={<StatisticsPage />} />
                    </Route>
                    <Route
                        path="register-student"
                        element={<Layout renderTemplate={false} />}
                    >
                        <Route path="" element={<RegisterStudentPage />} />
                    </Route>
                </Route>
            </Route>

            {/* accessable after admin key verificaiton */}

            <Route path="admin" element={<Layout renderTemplate={false} />}>
                <Route path="" element={<AdminPage />} />
                <Route path="new-canteen" element={<RegisterCanteenPage />} />
            </Route>

            {/* accessable after staff key verificaiton */}

            <Route path="kitchen" element={<Layout renderTemplate={false} />}>
                <Route path="" element={<KitchenPage />} />
            </Route>

            {/* public routes */}
            <Route element={<Layout renderTemplate={false} />}>
                <Route path="login" element={<LoginPage />} />
                <Route path="new-user" element={<NewUserPage />} />
                <Route path="server-error" element={<ServerErrorPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Route>
    )
);

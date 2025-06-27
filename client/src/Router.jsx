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
    ProtectedRoute,
    BillsPage,
    NewUserPage,
    TodayOrdersPage,
    StudentOrdersPage,
    CartPage,
    StudentBillsPage,
    KitchenPage,
    AdminPage,
    RegisterCanteenPage,
    VerifyKitchenKeyPage,
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
            {/* Authenticated Routes */}
            <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                    <Route path="" element={<HomePage />} />
                </Route>
            </Route>

            {/* Redirect staff */}
            <Route
                element={<ProtectedRoute roles={['student', 'contractor']} />}
            >
                <Route element={<Layout />}>
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
            </Route>

            {/* Contractor only */}
            <Route element={<ProtectedRoute roles={['contractor']} />}>
                <Route element={<Layout />}>
                    <Route path="today-orders" element={<TodayOrdersPage />} />
                    <Route path="all-bills" element={<BillsPage />} />
                    <Route path="students" element={<StudentsPage />} />
                </Route>

                <Route
                    path="register-student"
                    element={<Layout renderTemplate={false} />}
                >
                    <Route path="" element={<RegisterStudentPage />} />
                </Route>
            </Route>

            {/* Student only */}
            <Route element={<ProtectedRoute roles={['student']} />}>
                <Route path="cart" element={<CartPage />} />
            </Route>

            {/* Admin only (with admin key verification) */}
            <Route path="admin" element={<Layout renderTemplate={false} />}>
                <Route path="" element={<AdminPage />} />
                <Route path="new-canteen" element={<RegisterCanteenPage />} />
            </Route>

            {/* Kitchen Staff only */}
            <Route
                path="kitchen"
                element={<ProtectedRoute roles={['staff', 'contractor']} />}
            >
                <Route element={<Layout renderTemplate={false} />}>
                    <Route path="" element={<KitchenPage />} />
                    <Route
                        path="verify-key"
                        element={<VerifyKitchenKeyPage />}
                    />
                </Route>
            </Route>

            {/* Public Routes */}
            <Route element={<Layout renderTemplate={false} />}>
                <Route path="login" element={<LoginPage />} />
                <Route path="new-user" element={<NewUserPage />} />
                <Route path="server-error" element={<ServerErrorPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Route>
    )
);

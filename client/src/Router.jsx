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
    AccessTo,
    BillsPage,
    NewUserPage,
    TodayOrdersPage,
    StudentOrdersPage,
    CartPage,
    StudentBillsPage,
    AdminPage,
    RegisterCanteenPage,
    VerifyAdminKeyPage,
    DemoCredentialsPage,
    AboutPage,
    ContactPage,
    PrivacyPolicyPage,
    HistoryPage,
    VerifyKitchenKeyPage,
} from './Pages';

import { UpdateAccountDetails, UpdatePassword, Layout } from './Components';

export const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<App />}>
            <Route element={<AccessTo roles={['student', 'contractor']} />}>
                <Route element={<Layout />}>
                    <Route path="" element={<HomePage />} />
                </Route>
            </Route>

            {/* Student & Contractor only */}
            <Route element={<AccessTo roles={['student', 'contractor']} />}>
                <Route element={<Layout />}>
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
            <Route element={<AccessTo roles={['contractor']} />}>
                <Route element={<Layout />}>
                    <Route path="today-orders" element={<TodayOrdersPage />} />
                    <Route path="history" element={<HistoryPage />} />
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
            <Route element={<AccessTo roles={['student']} />}>
                <Route element={<Layout />}>
                    <Route path="settings" element={<SettingsPage />}>
                        <Route path="" element={<UpdateAccountDetails />} />
                        <Route path="password" element={<UpdatePassword />} />
                    </Route>
                    <Route path="cart" element={<CartPage />} />
                </Route>
            </Route>

            <Route element={<Layout renderTemplate={false} />}>
                <Route path="admin">
                    <Route path="verify-key" element={<VerifyAdminKeyPage />} />

                    <Route element={<AccessTo roles={['admin']} />}>
                        <Route path="" element={<AdminPage />} />
                        <Route
                            path="new-canteen"
                            element={<RegisterCanteenPage />}
                        />
                    </Route>
                </Route>

                <Route
                    path="verify-kitchen-key"
                    element={<VerifyKitchenKeyPage />}
                />

                <Route path="new-user" element={<NewUserPage />} />
                <Route path="demo" element={<DemoCredentialsPage />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
                <Route path="server-error" element={<ServerErrorPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Route>
    )
);

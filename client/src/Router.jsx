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
    SupportPage,
    AboutUsPage,
    ContactUsPage,
    ServerErrorPage,
    NotFoundPage,
    Redirect,
    FAQpage,
    NewUserPage,
    TodayOrdersPage,
    StudentOrdersPage,
    MyBillsPage,
    MyOrdersPage,
    CartPage,
    BillsPage,
    KitchenPage,
    StatisticsPage,
    AdminPage,
    RegisterCanteenPage,
} from './Pages';

import { UpdateAccountDetails, UpdatePassword, Layout } from './Components';

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
                    </Route>
                    <Route path="support" element={<SupportPage />} />
                    <Route path="about-us" element={<AboutUsPage />} />
                    <Route path="contact-us" element={<ContactUsPage />} />
                    <Route path="faqs" element={<FAQpage />} />
                </Route>

                {/* accessable to student only */}

                <Route element={<Redirect who="student" />}>
                    {/* who => who can access the page */}
                    <Route element={<Layout />}>
                        <Route path="cart" element={<CartPage />} />
                        <Route path="my-bills" element={<MyBillsPage />} />
                        <Route path="my-orders" element={<MyOrdersPage />} />
                    </Route>
                </Route>

                {/* accessable to contractor only */}

                <Route element={<Redirect who="contractor" />}>
                    <Route element={<Layout />}>
                        <Route
                            path="today-orders"
                            element={<TodayOrdersPage />}
                        />
                        <Route
                            path="orders/:studentId"
                            element={<StudentOrdersPage />}
                        />
                        <Route
                            path="register-student"
                            element={<RegisterStudentPage />}
                        />
                        <Route path="bills" element={<BillsPage />} />
                        <Route path="students" element={<StudentsPage />} />
                        <Route path="statistics" element={<StatisticsPage />} />
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
            <Route path="login" element={<LoginPage />} />
            <Route path="new-user" element={<Layout renderTemplate={false} />}>
                <Route path="" element={<NewUserPage />} />
            </Route>
            <Route path="server-error" element={<ServerErrorPage />} />
            <Route path="*" element={<NotFoundPage />} />
        </Route>
    )
);

import { Outlet } from 'react-router-dom';
import { Header, Footer, Sidebar, Popup } from '..';
import { Toaster } from 'react-hot-toast';

export default function Layout({ renderTemplate = true }) {
    return renderTemplate ? (
        <div className="overflow-y-scroll h-full w-full">
            <Header />
            <hr className="w-full" />
            <Sidebar />
            <main className="mt-[60px] p-4 min-h-[calc(100%-60px)] w-full bg-[#f9f9f9]">
                <Outlet />
            </main>
            <hr className="border-gray-300" />
            <Footer />
            <Popup />
            <Toaster />
        </div>
    ) : (
        <div className="overflow-y-scroll h-full w-full">
            <Outlet />
            <Popup />
            <Toaster />
        </div>
    );
}

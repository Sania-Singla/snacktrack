import { Outlet, useLocation } from 'react-router-dom';
import { Header, Footer, Sidebar, Popup, Searchbar } from '..';
import { Toaster } from 'react-hot-toast';
import { useEffect, useRef } from 'react';

export default function Layout({ renderTemplate = true }) {
    const { pathname } = useLocation();
    const layoutRef = useRef(null);

    // scrolling both window and layout container to the top
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        layoutRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, [pathname]);

    return renderTemplate ? (
        <div ref={layoutRef} className="overflow-y-scroll h-full w-full">
            <Header />
            <hr className="w-full" />
            <Sidebar />
            <main className="mt-[60px] p-4 min-h-[calc(100%-60px)] w-full bg-[#f9f9f9]">
                <div className="mb-6 mt-2 w-full sm:hidden">
                    <Searchbar />
                </div>
                <Outlet />
            </main>
            <hr className="border-gray-300" />
            <Footer />
            <Popup />
            <Toaster />
        </div>
    ) : (
        <div ref={layoutRef} className="overflow-y-scroll h-full w-full">
            <Outlet />
            <Popup />
            <Toaster />
        </div>
    );
}

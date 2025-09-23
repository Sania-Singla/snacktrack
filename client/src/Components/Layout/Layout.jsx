import { Outlet, useLocation } from 'react-router-dom';
import { Header, Footer, Sidebar, Popup, Searchbar } from '..';
import { Toaster } from 'react-hot-toast';
import { useEffect, useRef } from 'react';

export default function Layout({ renderTemplate = true }) {
    const { pathname } = useLocation();
    const layoutRef = useRef(null);

    // scrolling to top on route change
    useEffect(() => {
        if (layoutRef.current) {
            layoutRef.current.scrollTop = 0;
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [pathname]);

    const staticPages = ['/settings', '/statistics', '/cart'];
    const isStaticPage = staticPages.some((page) => pathname.startsWith(page));

    if (renderTemplate) {
        return (
            <div className="flex flex-col h-screen w-screen">
                <Header />
                <hr className="w-full" />
                <div className="flex flex-1 overflow-hidden">
                    <Sidebar />
                    <main
                        ref={layoutRef}
                        className="flex-1 p-4 mt-[60px] overflow-y-auto bg-gray-50"
                    >
                        {!isStaticPage && (
                            <div className="mb-6 mx-4 mt-2 sm:hidden">
                                <Searchbar />
                            </div>
                        )}
                        <div className="min-h-[calc(100vh-60px)]">
                            <Outlet />
                        </div>
                        <Footer />
                    </main>
                </div>
                <Popup />
                <Toaster />
            </div>
        );
    }

    return (
        <div ref={layoutRef} className="h-screen w-screen overflow-y-auto">
            <Outlet />
            <Popup />
            <Toaster />
        </div>
    );
}

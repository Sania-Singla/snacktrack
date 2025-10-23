import { Outlet, useLocation } from 'react-router-dom';
import { Header, Footer, Sidebar, Popup, Searchbar } from '..';
import { Toaster } from 'react-hot-toast';
import { useEffect, useRef } from 'react';
import { useUserContext } from '../../Contexts';

export default function Layout({ renderTemplate = true }) {
    const { pathname } = useLocation();
    const layoutRef = useRef(null);
    const { user } = useUserContext();

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
                    {user && <Sidebar />}
                    <main
                        ref={layoutRef}
                        className="flex-1 p-4 mt-[60px] overflow-auto bg-gray-50"
                    >
                        {!isStaticPage && (
                            <div className="mb-6 mt-2 sm:hidden">
                                <Searchbar />
                            </div>
                        )}
                        <div className="mb-20 min-h-[calc(100vh-60px)]">
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

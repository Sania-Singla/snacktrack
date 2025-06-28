import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUserContext } from '../../Contexts';

export function ProtectedRoute({ roles = [] }) {
    const { user } = useUserContext();
    const location = useLocation();

    if (!user) {
        // Unauthenticated
        if (location.pathname.includes('kitchen')) {
            return <Navigate to="/kitchen/verify-key" replace />;
        } else {
            return (
                <Navigate
                    to={location.pathname === '/' ? '/new-user' : '/login'}
                    replace
                />
            );
        }
    }

    if (location.pathname === '/' && user.role === 'staff') {
        return <Navigate to="/kitchen" replace />;
    }

    if (roles.length > 0 && !roles.includes(user.role)) {
        // Role not authorized
        return <Navigate to="/not-found" replace />;
    }

    // Authorized
    return <Outlet />;
}

export function NewUserPageRedirect() {
    const { user } = useUserContext();

    if (user) {
        return <Navigate to="/not-found" replace />;
    }

    return <Outlet />;
}

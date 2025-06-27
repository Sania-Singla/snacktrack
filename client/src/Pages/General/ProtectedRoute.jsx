import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUserContext } from '../../Contexts';

export default function ProtectedRoute({ roles = [] }) {
    const { user } = useUserContext();
    const location = useLocation();

    if (!user) {
        // Unauthenticated
        return (
            <Navigate
                to={location.pathname === '/' ? '/new-user' : '/login'}
                replace
            />
        );
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

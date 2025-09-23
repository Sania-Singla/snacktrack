import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUserContext } from '../../Contexts';

export default function ProtectedRoute({ roles = [] }) {
    const { user } = useUserContext();
    const location = useLocation();

    if (!user) {
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

    if (user.role === 'staff' && location.pathname === '/') {
        return <Navigate to="/new-user" replace />;
    }

    if (roles.length > 0 && !roles.includes(user.role)) {
        return <Navigate to="/not-found" replace />;
    }

    return <Outlet />;
}

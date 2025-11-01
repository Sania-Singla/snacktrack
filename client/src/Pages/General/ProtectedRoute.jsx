import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUserContext } from '../../Contexts';

export default function AccessTo({ roles = [] }) {
    const { user } = useUserContext();
    const location = useLocation();

    if (!user) {
        if (location.pathname.includes('admin')) {
            return <Navigate to="/admin/verify-key" replace />;
        } else {
            return <Navigate to={'/new-user'} replace />;
        }
    }

    if (
        user.role === 'admin' &&
        !user.canteenId && // abhi proceeding nhi hua sirf admin key verify krke baitha hai
        !location.pathname.includes('admin')
    ) {
        return <Navigate to={'/admin'} replace />;
    }

    if (roles.length && !roles.includes(user.role)) {
        if (location.pathname.includes('admin')) {
            return <Navigate to="/admin/verify-key" replace />;
        } else {
            return <Navigate to={'/not-found'} replace />;
        }
    }

    return <Outlet />;
}

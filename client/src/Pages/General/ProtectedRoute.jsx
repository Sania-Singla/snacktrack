import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useUserContext } from '../../Contexts';

export default function AccessTo({ roles = [] }) {
    const { user } = useUserContext();
    const location = useLocation();

    if (!user || (roles.length && !roles.includes(user.role))) {
        if (location.pathname.includes('admin'))
            return <Navigate to="/admin/verify-key" replace />;
        else return <Navigate to={'/new-user'} replace />;
    }

    return <Outlet />;
}

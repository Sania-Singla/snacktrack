import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useUserContext } from '../Contexts';
import { useEffect } from 'react';

export default function Redirect({ who = '' }) {
    const { user } = useUserContext();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        if (!user) {
            navigate(pathname === '/' ? '/new-user' : '/login', {
                replace: true,
            });
        } else if (who && who !== user.role) {
            navigate('/not-found', { replace: true });
        }
    }, [user, navigate]);

    if (!user || (who && who !== user.role)) return null; // removes that fraction of seconds lag

    return <Outlet />;
}

import { UpdatePasswordAdmin, UpdatePasswordStudent } from '..';
import { useUserContext } from '../../Contexts';

export default function UpdatePassword() {
    const { user } = useUserContext();

    return user.role === 'admin' ? (
        <UpdatePasswordAdmin />
    ) : (
        <UpdatePasswordStudent />
    );
}

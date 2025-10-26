import { UpdateAccountDetailsAdmin, UpdateAccountDetailsStudent } from '..';
import { useUserContext } from '../../Contexts';

export default function UpdateAccountDetails() {
    const { user } = useUserContext();

    return user.role === 'admin' ? (
        <UpdateAccountDetailsAdmin />
    ) : (
        <UpdateAccountDetailsStudent />
    );
}

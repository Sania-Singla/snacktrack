import { Button } from '..';
import { userService } from '../../Services';
import { icons } from '../../Assets/icons';
import { useState } from 'react';
import { useStudentContext, useUserContext } from '../../Contexts';
import { checkTokenExpired } from '../../Utils';
import toast from 'react-hot-toast';

export default function Logout() {
    const [loading, setLoading] = useState(false);
    const { setUser } = useUserContext();
    const { setCartItems } = useStudentContext();

    async function logout() {
        setLoading(true);
        try {
            const res = await userService.logout();
            if (res && res.message === 'user loggedout successfully') {
                setUser(null);
                localStorage.clear();
                setCartItems([]);
                toast.success('Logged out Successfully 🙂');
            } else checkTokenExpired(res, setUser);
        } catch (err) {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Button
            onClick={logout}
            disabled={loading}
            btnText={
                loading ? (
                    <div className="flex items-center justify-center w-full">
                        <div className="size-5 fill-[#4977ec] dark:text-[#a2bdff]">
                            {icons.loading}
                        </div>
                    </div>
                ) : (
                    'Logout'
                )
            }
            title="Logout"
            className="text-white font-normal rounded-md w-[75px] h-7.5 bg-[#4977ec] hover:bg-[#3b62c2]"
        />
    );
}

import { useEffect } from 'react';
import { useSocketContext, useUserContext } from '../../Contexts';
import { SOCKET_EVENTS } from '../../Constants';
import { contractorService } from '../../Services';
import { Button } from '..';

export default function StatusBadge() {
    const { socket } = useSocketContext();
    const { user, setUser } = useUserContext();

    useEffect(() => {
        if (!socket) return;

        socket.on(
            SOCKET_EVENTS.CANTEEN_OPEN_STATUS_CHANGED,
            ({ isOpen, canteenId }) => {
                if (user.canteenId !== canteenId) return;
                setUser((prev) => ({ ...prev, isOpen }));
            }
        );

        return () => {
            socket.off(SOCKET_EVENTS.CANTEEN_OPEN_STATUS_CHANGED);
        };
    }, [socket]);

    return user.role !== 'contractor' ? (
        <Button
            onClick={async () => {
                await contractorService.changeCanteenStatus(!user.isOpen);
            }}
            btnText={
                <div className="flex items-center justify-center gap-1.5">
                    {user.isOpen ? 'Close' : 'Open'}
                </div>
            }
            title={user.isOpen ? 'Close' : 'Open'}
            className={`text-white rounded-md w-fit text-nowrap px-2 h-6.5 text-sm font-medium shadow-xs ${user.isOpen ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
        />
    ) : (
        <p
            className={`rounded-md w-fit text-nowrap px-2 py-0.5 text-sm font-medium border ${
                user.isOpen
                    ? 'text-green-700 border-green-400 bg-green-50 shadow-[0_0_8px_rgba(34,197,94,0.4)] animate-glow-green'
                    : 'text-red-700 border-red-400 bg-red-50 shadow-[0_0_8px_rgba(239,68,68,0.4)] animate-glow-red'
            }`}
        >
            {user.isOpen ? 'Open' : 'Closed'}
        </p>
    );
}

import { SnackView, Button } from '../../Components';
import {
    useSnackContext,
    useSearchContext,
    usePopupContext,
    useUserContext,
} from '../../Contexts';
import { icons } from '../../Assets/icons';

export default function Snacks() {
    const { snacks } = useSnackContext();
    const { search } = useSearchContext();
    const { user } = useUserContext();
    const { setShowPopup, setPopupInfo } = usePopupContext();

    const snackElements = snacks
        ?.filter(
            (snack) =>
                !search ||
                snack.name.toLowerCase().includes(search.toLowerCase())
        )
        .map((snack) => <SnackView key={snack._id} snack={snack} />);

    function addSnack() {
        setShowPopup(true);
        setPopupInfo({ type: 'addSnack' });
    }

    return snackElements.length > 0 ? (
        <div className="relative">
            {user.role === 'contractor' && (
                <Button
                    onClick={addSnack}
                    btnText={
                        <div className="flex items-center justify-center gap-2">
                            <div className="size-[16px] fill-white">
                                {icons.plus}
                            </div>
                            <span className="text-[18px]">Add Snack</span>
                        </div>
                    }
                    title="Add Snack"
                    className="absolute z-[1] -top-16 text-white rounded-md w-fit text-nowrap px-3 h-[39px] bg-[#4977ec] hover:bg-[#3b62c2]"
                />
            )}
            <div
                className={`grid gap-5 ${snackElements.length <= 2 ? 'grid-cols-[repeat(auto-fit,minmax(250px,1fr))] lg:grid-cols-[repeat(auto-fit,minmax(250px,350px))]' : 'grid-cols-[repeat(auto-fit,minmax(250px,1fr))]'}`}
            >
                {snackElements}
            </div>
        </div>
    ) : (
        <div>No Snacks Found !!</div>
    );
}

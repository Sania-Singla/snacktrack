import { useSearchParams } from 'react-router-dom';
import { Button } from '..';
import { icons } from '../../Assets/icons';
import { usePopupContext } from '../../Contexts';

export default function AddBtn() {
    const { setShowPopup, setPopupInfo } = usePopupContext();
    const [searchParams] = useSearchParams();
    const filter = searchParams.get('filter') || 'snacks';

    function addItem() {
        setShowPopup(true);
        setPopupInfo({ type: 'addItem' });
    }

    function addSnack() {
        setShowPopup(true);
        setPopupInfo({ type: 'addSnack' });
    }

    return (
        <Button
            onClick={filter === 'snacks' ? addSnack : addItem}
            btnText={
                <div className="flex items-center justify-center gap-1.5 px-1">
                    <div className="size-3 fill-white">{icons.plus}</div>
                    <span>{filter === 'snacks' ? 'Snack' : 'Item'}</span>
                </div>
            }
            title={filter === 'snacks' ? 'Add Snack' : 'Add Item'}
            className="text-white rounded-md px-2 h-7.5 text-nowrap bg-[#4977ec] hover:bg-[#3b62c2]"
        />
    );
}

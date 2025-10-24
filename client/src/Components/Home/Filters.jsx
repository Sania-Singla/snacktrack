import { useSearchParams } from 'react-router-dom';
import { Button } from '..';
import { icons } from '../../Assets/icons';

export default function Filters() {
    const [searchParams, setSearchParams] = useSearchParams();

    return (
        <div className="flex items-center justify-end w-full gap-4">
            <Button
                onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set('filter', 'snacks');
                    setSearchParams(params);
                }}
                className="hover:bg-gray-100 border bg-white border-gray-200 shadow-xs rounded-md px-2 py-1"
                btnText={
                    <div className="flex items-center justify-center gap-2">
                        <div className="size-3.5 fill-gray-700">
                            {icons.snack}
                        </div>
                        <span>Snacks</span>
                    </div>
                }
            />

            <Button
                onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set('filter', 'packaged');
                    setSearchParams(params);
                }}
                className="hover:bg-gray-100 border bg-white border-gray-200 shadow-xs rounded-md px-2 py-1"
                btnText={
                    <div className="flex items-center justify-center gap-2">
                        <div className="size-4 stroke-gray-600">
                            {icons.soda}
                        </div>
                        <span>Packaged</span>
                    </div>
                }
            />
        </div>
    );
}

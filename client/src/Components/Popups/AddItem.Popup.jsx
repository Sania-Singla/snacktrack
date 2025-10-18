import { useState } from 'react';
import { contractorService } from '../../Services';
import {
    usePopupContext,
    useSnackContext,
    useUserContext,
} from '../../Contexts';
import { Button, InputField } from '..';
import { checkTokenExpired, verifyExpression } from '../../Utils';
import toast from 'react-hot-toast';
import { icons } from '../../Assets/icons';

export default function AddItemPopup() {
    const { setItems } = useSnackContext();
    const [inputs, setInputs] = useState({ name: '', price: 0 });
    const [error, setError] = useState({});
    const [disabled, setDisabled] = useState(true);
    const { setShowPopup } = usePopupContext();
    const [loading, setLoading] = useState(false);
    const { setUser } = useUserContext();

    async function handleChange(e) {
        const { value, name } = e.target;
        setInputs((prev) => ({ ...prev, [name]: value }));
        if (value) verifyExpression(name, value, setError);
        onMouseOver();
    }

    function handleDisable() {
        return (
            Object.values(inputs).some((value) => !value) ||
            Object.entries(error).some(
                ([key, value]) => value && key !== 'root'
            )
        );
    }

    function onMouseOver() {
        setDisabled(handleDisable());
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (handleDisable()) {
            toast.error('Please fill all fields correctly');
            return;
        }

        setLoading(true);
        setDisabled(true);
        setError({});
        try {
            const res = await contractorService.addItem(inputs);
            if (res && !res.message) {
                toast.success('Item added successfully 👍');
                setItems((prev) => [res, ...prev]);
                setShowPopup(false);
            } else if (res && res.message !== 'tokens missing') {
                setError((prev) => ({ ...prev, root: res.message }));
            } else checkTokenExpired(res, setUser);
        } catch (err) {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setDisabled(false);
            setLoading(false);
        }
    }

    const inputFields = [
        {
            type: 'text',
            name: 'name',
            label: 'Name',
            placeholder: 'Enter item name',
            required: true,
        },
        {
            type: 'number',
            name: 'price',
            label: 'Price',
            placeholder: 'Enter item price',
            required: true,
        },
    ];

    const inputElements = inputFields.map((field) => (
        <div className="w-full" key={field.name}>
            <InputField
                field={field}
                handleChange={handleChange}
                error={error}
                inputs={inputs}
            />
            {error[field.name] && (
                <div className="text-red-500 text-xs font-medium">
                    {error[field.name]}
                </div>
            )}
        </div>
    ));

    return (
        <div className="overflow-hidden relative w-[350px] sm:w-[450px] transition-all duration-300 bg-white rounded-xl text-black p-5 flex flex-col items-center justify-center gap-3">
            <Button
                btnText={
                    <div className="size-[20px] stroke-black">
                        {icons.cross}
                    </div>
                }
                title="Close"
                onClick={() => setShowPopup(false)}
                className="absolute top-2 right-2"
            />

            <p className="text-2xl font-bold">Add New Item</p>

            <div className="w-full flex flex-col items-center justify-center gap-3">
                {error.root && (
                    <div className="text-red-500 w-full text-center">
                        {error.root}
                    </div>
                )}

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col items-start justify-center gap-3 w-full"
                >
                    {inputElements}

                    <Button
                        type="submit"
                        className="text-white rounded-md py-2 mt-4 h-[40px] flex items-center justify-center text-lg w-full bg-[#4977ec] hover:bg-[#3b62c2] transition-all duration-200 hover:shadow-md active:scale-[98%]"
                        disabled={disabled}
                        onMouseOver={onMouseOver}
                        btnText={
                            loading ? (
                                <div className="flex items-center justify-center w-full">
                                    <div className="size-5 fill-[#4977ec] dark:text-[#a2bdff]">
                                        {icons.loading}
                                    </div>
                                </div>
                            ) : (
                                'Add'
                            )
                        }
                    />
                </form>
            </div>
        </div>
    );
}

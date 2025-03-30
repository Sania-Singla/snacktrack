import { useState, useEffect } from 'react';
import { contractorService } from '../../Services';
import { usePopupContext, useSnackContext } from '../../Contexts';
import { useNavigate } from 'react-router-dom';
import { Button, InputField } from '..';
import { verifyExpression } from '../../Utils';
import toast from 'react-hot-toast';
import { icons } from '../../Assets/icons';

export default function AddItemPopup() {
    const { setItems } = useSnackContext();
    const [inputs, setInputs] = useState({
        category: '',
        password: '',
    });

    const [variants, setVariants] = useState([]);
    const [error, setError] = useState({});
    const [variantErrors, setVariantErrors] = useState({});
    const [disabled, setDisabled] = useState(false);
    const { setShowPopup } = usePopupContext();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    // Check for duplicate prices whenever variants change
    useEffect(() => {
        const prices = variants.map((variant) => variant.price);
        const newVariantErrors = {};

        variants.forEach((variant, index) => {
            if (
                prices.filter((price) => price === variant.price).length > 1 &&
                variant.price !== 0
            ) {
                newVariantErrors[index] = 'Price already exists';
            } else {
                newVariantErrors[index] = '';
            }
        });

        setVariantErrors(newVariantErrors);
    }, [variants]);

    async function handleChange(e) {
        const { value, name } = e.target;
        setInputs((prev) => ({ ...prev, [name]: value }));
    }

    const handleVariantChange = (i, e) => {
        const { name, value } = e.target;
        setVariants((prev) =>
            prev.map((variant, index) =>
                index === i ? { ...variant, [name]: Number(value) } : variant
            )
        );
    };

    const addVariant = () => {
        if (variants.length < 3) {
            setVariants([...variants, { price: 0, availableCount: 0 }]);
        }
    };

    const removeVariant = (index) => {
        const updatedVariants = variants.filter((_, i) => i !== index);
        setVariants(updatedVariants);
    };

    const handleBlur = (e) => {
        let { name, value } = e.target;
        if (value) verifyExpression(name, value, setError);
    };

    function onMouseOver() {
        if (
            Object.values(inputs).some((value) => !value) ||
            variants.some(
                (variant) => !variant.price || !variant.availableCount
            ) ||
            Object.entries(error).some(
                ([key, value]) => value && key !== 'root'
            ) ||
            Object.values(variantErrors).some((error) => error)
        ) {
            setDisabled(true);
        } else setDisabled(false);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!variants.length) {
            toast.error('At least one variant is required.');
            return;
        }
        setLoading(true);
        setDisabled(true);
        setError({});
        try {
            const res = await contractorService.addItem({
                ...inputs,
                variants,
            });
            if (res && !res.message) {
                toast.success('Item added successfully 👍');
                setItems((prev) => [res, ...prev]);
                setShowPopup(false);
            } else setError((prev) => ({ ...prev, root: res.message }));
        } catch (err) {
            navigate('/server-error');
        } finally {
            setDisabled(false);
            setLoading(false);
        }
    }

    const variantElements = variants.map((variant, i) => (
        <div key={i} className="flex gap-2">
            <div className="w-full">
                <InputField
                    inputs={variant}
                    field={{
                        type: 'number',
                        name: 'price',
                        label: 'Price',
                        placeholder: 'Enter price',
                        required: true,
                    }}
                    handleChange={(e) => handleVariantChange(i, e)}
                />
                {variantErrors[i] && (
                    <p className="text-red-500 text-xs font-medium">
                        {variantErrors[i]}
                    </p>
                )}
            </div>
            <InputField
                inputs={variant}
                field={{
                    type: 'number',
                    name: 'availableCount',
                    label: 'No of pcs',
                    placeholder: 'Enter no. of pcs',
                    required: true,
                }}
                handleChange={(e) => handleVariantChange(i, e)}
            />
            <Button
                btnText={
                    <div className="size-[16px] stroke-red-500">
                        {icons.cross}
                    </div>
                }
                onClick={() => removeVariant(i)}
                className="p-[5px] bg-red-100 rounded-full size-fit relative top-[29px]"
            />
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
                    className="flex flex-col items-start justify-center gap-4 w-full"
                >
                    <div className="w-full">
                        <InputField
                            field={{
                                type: 'text',
                                name: 'category',
                                label: 'Category',
                                placeholder: 'Enter Item category',
                                required: true,
                            }}
                            handleBlur={handleBlur}
                            handleChange={handleChange}
                            error={error}
                            inputs={inputs}
                        />
                        {error.category && (
                            <p className="text-red-500 text-xs font-medium">
                                {error.category}
                            </p>
                        )}
                    </div>

                    {/* Variants */}
                    <div className="w-full">
                        <p className="font-medium">Variants :</p>
                        <div className="flex flex-col gap-1">
                            {variantElements}
                        </div>
                        {variants.length < 3 && (
                            <div>
                                <Button
                                    btnText="Add Variant"
                                    onClick={addVariant}
                                    className="w-full bg-gray-200 mt-4 hover:border-gray-800 border-transparent border-[0.01rem] text-gray-800 py-2 rounded-md"
                                />
                            </div>
                        )}
                    </div>

                    <InputField
                        field={{
                            type: showPassword ? 'text' : 'password',
                            name: 'password',
                            label: 'Password',
                            placeholder: 'Enter password to confirm',
                            required: true,
                        }}
                        handleChange={handleChange}
                        error={error}
                        inputs={inputs}
                        showPassword={showPassword}
                        setShowPassword={setShowPassword}
                        className="relative -top-2"
                    />

                    <div className="w-full">
                        <Button
                            type="submit"
                            className="text-white rounded-md py-2 flex items-center justify-center text-lg w-full bg-[#4977ec] hover:bg-[#3b62c2]"
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
                    </div>
                </form>
            </div>
        </div>
    );
}

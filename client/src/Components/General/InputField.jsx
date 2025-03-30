import { icons } from '../../Assets/icons';

export default function InputField({
    field = {
        name: '',
        type: '',
        required: false,
        label: '',
        placeholder: '',
        id: '',
    },
    inputs,
    handleChange = null,
    handleBlur = null,
    setShowPassword = null,
    showPassword = false,
    className = '',
}) {
    const passwordVariants = [
        'password',
        'oldPassword',
        'newPassword',
        'confirmPassword',
        'contractorPassword',
    ];
    return (
        <div key={field.name} className={`w-full ${className}`}>
            <div className="bg-white z-[1] ml-2 px-[5px] w-fit relative top-[10px] text-[15px] font-medium">
                <label htmlFor={field.name}>
                    {field.required && <span className="text-red-500">* </span>}
                    {field.label} :
                </label>
            </div>
            <div className="relative w-full">
                <input
                    type={field.type}
                    name={field.name}
                    id={field.id || field.name}
                    value={inputs[field.name]}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={field.placeholder}
                    className="overflow-x-scroll shadow-sm py-2 rounded-md px-3 w-full border-[0.01rem] border-gray-500 bg-transparent placeholder:text-[15px]"
                />
                {passwordVariants.includes(field.name) && (
                    <div
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="size-[16px] absolute right-0 top-[50%] transform translate-y-[-50%] mr-4 cursor-pointer fill-[#474747]"
                    >
                        {showPassword ? icons.eyeOff : icons.eye}
                    </div>
                )}
            </div>
        </div>
    );
}

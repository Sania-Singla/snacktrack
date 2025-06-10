import { icons } from '../../Assets/icons';

export default function InputField({
    field,
    inputs,
    handleChange = null,
    handleBlur = null,
    setShowPassword = null,
    showPassword = false,
    className = '',
    ...props
}) {
    const { name, type, required, label, placeholder, id, ...rest } = field;

    const passwordVariants = [
        'password',
        'oldPassword',
        'newPassword',
        'confirmPassword',
        'contractorPassword',
        'newKey',
        'confirmKey',
    ];
    return (
        <div key={name} className={`w-full ${className}`}>
            <div className="bg-white z-[1] ml-2 px-[5px] w-fit relative top-[10px] text-[15px] font-medium">
                <label htmlFor={name}>
                    {required && <span className="text-red-500">* </span>}
                    {label} :
                </label>
            </div>
            <div className="relative w-full">
                <input
                    type={type}
                    name={name}
                    min={type === 'number' ? '0' : undefined}
                    id={id || name}
                    value={inputs[name]}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    {...rest}
                    {...props}
                    className="overflow-x-scroll disabled:opacity-50 disabled:cursor-not-allowed shadow-sm py-2 rounded-md px-3 w-full border-[0.01rem] border-gray-500 bg-transparent placeholder:text-[15px]"
                />
                {passwordVariants.includes(name) && (
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

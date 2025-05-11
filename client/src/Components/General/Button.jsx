export default function Button({
    disabled = false,
    className = '',
    btnText,
    type = 'button',
    ...props
}) {
    return (
        <button
            type={type}
            disabled={disabled}
            {...props}
            className={`disabled:cursor-not-allowed cursor-pointer ${className}`}
        >
            {btnText}
        </button>
    );
}

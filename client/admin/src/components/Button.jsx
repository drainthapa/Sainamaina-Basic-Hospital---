import './Button.css';

const VARIANT_CLASS = {
  primary: 'btn btn-primary',
  secondary: 'btn btn-secondary',
  danger: 'btn btn-danger',
  ghost: 'btn btn-ghost',
};

export default function Button({
  variant = 'primary', size = 'md', isLoading = false, children, disabled, type = 'button', ...rest
}) {
  return (
    <button
      type={type}
      className={`${VARIANT_CLASS[variant] || VARIANT_CLASS.primary} btn-${size}`}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? 'Please wait…' : children}
    </button>
  );
}

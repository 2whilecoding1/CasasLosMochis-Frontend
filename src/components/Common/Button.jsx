const variants = {
  primary: 'bg-gold-500 hover:bg-gold-600 text-[#1a1a1a] shadow-sm',
  secondary: 'bg-silver-400 hover:bg-silver-500 text-[#1a1a1a] shadow-sm',
  outline: 'border-2 border-gold-500 text-gold-600 hover:bg-gold-50 bg-transparent',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-7 py-3.5 text-lg',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  as: Tag = 'button',
  ...props
}) {
  return (
    <Tag
      className={`
        inline-flex items-center justify-center gap-2
        rounded-lg font-semibold font-[Inter]
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      disabled={Tag === 'button' ? disabled : undefined}
      {...props}
    >
      {children}
    </Tag>
  )
}

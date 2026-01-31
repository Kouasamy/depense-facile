import { type ButtonHTMLAttributes, forwardRef } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg' | 'icon'
    isLoading?: boolean
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {

        const baseStyles = "inline-flex items-center justify-center gap-2 rounded-full font-bold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:scale-95"

        const variants = {
            primary: "bg-[var(--color-primary)] text-[#0F1F1A] shadow-lg shadow-[var(--color-primary)]/25 hover:bg-[var(--color-primary-light)] hover:shadow-xl hover:shadow-[var(--color-primary)]/35 hover:-translate-y-0.5",
            secondary: "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)] border-2 border-[var(--color-border)] hover:bg-[var(--color-bg-hover)] hover:border-[var(--color-border-light)]",
            ghost: "bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]",
            danger: "bg-[var(--color-danger)]/10 text-[var(--color-danger)] border-2 border-[var(--color-danger)]/20 hover:bg-[var(--color-danger)] hover:text-white hover:border-transparent",
        }

        const sizes = {
            sm: "text-xs px-3 py-1.5",
            md: "text-sm px-5 py-2.5",
            lg: "text-base px-6 py-3",
            icon: "w-10 h-10 p-0 rounded-full flex items-center justify-center",
        }

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className || ''}`}
                disabled={isLoading || disabled}
                {...props}
            >
                {isLoading && (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                )}
                {!isLoading && leftIcon && <span className="flex items-center">{leftIcon}</span>}
                {children}
                {!isLoading && rightIcon && <span className="flex items-center">{rightIcon}</span>}
            </button>
        )
    }
)

Button.displayName = 'Button'

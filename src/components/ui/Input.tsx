import { type InputHTMLAttributes, forwardRef } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
    containerClassName?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, leftIcon, rightIcon, containerClassName, ...props }, ref) => {
        return (
            <div className={`w-full ${containerClassName || ''}`}>
                {label && (
                    <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2 ml-1">
                        {label}
                    </label>
                )}
                <div className="relative group">
                    {leftIcon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] group-focus-within:text-[var(--color-primary)] transition-colors pointer-events-none">
                            {leftIcon}
                        </div>
                    )}

                    <input
                        ref={ref}
                        className={`
              w-full bg-[var(--color-bg-input)] border-2 border-[var(--color-border)] rounded-[var(--radius-xl)]
              text-[var(--color-text-primary)] placeholder-[var(--color-text-placeholder)]
              py-3.5 px-4 outline-none transition-all duration-200
              hover:border-[var(--color-border-light)]
              focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10
              disabled:opacity-50 disabled:cursor-not-allowed
              ${leftIcon ? 'pl-12' : ''}
              ${rightIcon ? 'pr-12' : ''}
              ${error ? '!border-[var(--color-danger)] focus:!ring-[var(--color-danger)]/10' : ''}
              ${className || ''}
            `}
                        {...props}
                    />

                    {rightIcon && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                            {rightIcon}
                        </div>
                    )}
                </div>

                {error && (
                    <p className="mt-1.5 ml-1 text-sm text-[var(--color-danger)] animate-fade-in">
                        {error}
                    </p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'

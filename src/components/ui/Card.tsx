import { type HTMLAttributes, forwardRef } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'glass' | 'gradient' | 'outline'
    interactive?: boolean
    padding?: 'none' | 'sm' | 'md' | 'lg'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', interactive = false, padding = 'md', children, ...props }, ref) => {

        const baseStyles = "rounded-[var(--radius-xl)] transition-all duration-200"

        const variants = {
            default: "bg-[var(--color-bg-card)] border border-[var(--color-border)]",
            glass: "bg-[var(--color-bg-card)]/70 backdrop-blur-xl border border-white/10 shadow-lg",
            gradient: "relative bg-[var(--color-bg-card)] border-transparent bg-gradient-to-br from-[var(--color-bg-elevated)] to-[var(--color-bg-card)] before:absolute before:inset-0 before:p-[1px] before:rounded-[inherit] before:bg-gradient-to-br before:from-[var(--color-primary)]/20 before:to-[var(--color-secondary)]/20 before:-z-10 before:content-['']",
            outline: "bg-transparent border-2 border-[var(--color-border)] border-dashed",
        }

        const paddings = {
            none: "",
            sm: "p-3",
            md: "p-5",
            lg: "p-6 sm:p-8",
        }

        const interactiveStyles = interactive
            ? "cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:border-[var(--color-primary)]/50 active:scale-[0.98]"
            : ""

        return (
            <div
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${paddings[padding]} ${interactiveStyles} ${className || ''}`}
                {...props}
            >
                {children}
            </div>
        )
    }
)

Card.displayName = 'Card'

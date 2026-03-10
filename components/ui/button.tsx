import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'default', size = 'default', ...props }, ref) => {

        let variantStyles = "bg-vettrack-accent text-white hover:bg-vettrack-accent/90 shadow-sm";
        if (variant === 'destructive') variantStyles = "bg-vettrack-error text-white hover:bg-vettrack-error/90 shadow-sm";
        if (variant === 'outline') variantStyles = "border-2 border-border bg-transparent hover:bg-vettrack-muted hover:text-vettrack-dark";
        if (variant === 'secondary') variantStyles = "bg-vettrack-muted text-vettrack-dark hover:bg-vettrack-muted/80";
        if (variant === 'ghost') variantStyles = "hover:bg-vettrack-muted hover:text-vettrack-dark";
        if (variant === 'link') variantStyles = "text-vettrack-accent underline-offset-4 hover:underline";

        let sizeStyles = "h-11 px-4 py-2";
        if (size === 'sm') sizeStyles = "h-9 rounded-lg px-3 text-xs";
        if (size === 'lg') sizeStyles = "h-14 rounded-2xl px-8 text-base";
        if (size === 'icon') sizeStyles = "h-11 w-11";

        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
                    variantStyles,
                    sizeStyles,
                    className
                )}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }

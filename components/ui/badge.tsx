import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'secondary' | 'destructive' | 'success' | 'outline';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
    let variantStyles = "border-transparent bg-vettrack-accent/10 text-vettrack-accent";
    if (variant === 'secondary') variantStyles = "border-transparent bg-gray-100 text-gray-700";
    if (variant === 'destructive') variantStyles = "border-transparent bg-vettrack-error/10 text-vettrack-error";
    if (variant === 'success') variantStyles = "border-transparent bg-vettrack-success/10 text-vettrack-success";
    if (variant === 'outline') variantStyles = "text-vettrack-dark";

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                variantStyles,
                className
            )}
            {...props}
        />
    )
}

export { Badge }

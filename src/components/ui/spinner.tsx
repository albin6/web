import { Loader2, type LucideProps } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const spinnerVariants = cva(
    "animate-spin text-muted-foreground",
    {
        variants: {
            size: {
                default: "h-4 w-4",
                sm: "h-3 w-3",
                md: "h-6 w-6",
                lg: "h-8 w-8",
                xl: "h-12 w-12",
            },
        },
        defaultVariants: {
            size: "default",
        },
    }
);

export interface SpinnerProps
    extends Omit<LucideProps, "size">,
    VariantProps<typeof spinnerVariants> {
    fullScreen?: boolean;
    centered?: boolean;
}

export function Spinner({ className, size, fullScreen, centered, ...props }: SpinnerProps) {
    if (fullScreen) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-background/50 z-50 backdrop-blur-sm">
                <Loader2 className={cn(spinnerVariants({ size: "xl" }), "text-primary", className)} {...props} />
            </div>
        );
    }

    if (centered) {
        return (
            <div className="flex items-center justify-center w-full h-full min-h-[100px]">
                <Loader2 className={cn(spinnerVariants({ size: size === 'default' ? 'md' : size }), className)} {...props} />
            </div>
        );
    }

    return <Loader2 className={cn(spinnerVariants({ size }), className)} {...props} />;
}

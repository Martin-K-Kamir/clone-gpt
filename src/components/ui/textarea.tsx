import * as React from "react";

import { cn, generateSizePercentage } from "@/lib/utils";

import { Skeleton } from "./skeleton";

type TextareaProps = React.ComponentProps<"textarea"> & {
    isLoading?: boolean;
    skeletonsLength?: number;
    classNameSkeleton?: string;
    classNameInputWrapper?: string;
};

function Textarea({
    skeletonsLength = 2,
    className,
    isLoading,
    classNameSkeleton,
    classNameInputWrapper,
    placeholder,
    disabled,
    ...props
}: TextareaProps) {
    const textarea = (
        <textarea
            data-slot="textarea"
            className={cn(
                "field-sizing-content shadow-xs aria-invalid:ring-rose-700 aria-invalid:border-rose-700 flex min-h-16 w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-base outline-none transition-[color,box-shadow] placeholder:text-zinc-200/50 focus-visible:border-zinc-100 focus-visible:ring-1 focus-visible:ring-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                className,
            )}
            placeholder={isLoading ? "" : placeholder}
            disabled={isLoading || disabled}
            {...props}
        />
    );

    if (isLoading) {
        return (
            <div className={cn("relative", classNameInputWrapper)}>
                {textarea}
                <div className="absolute inset-0 space-y-2 p-3">
                    {Array.from({ length: skeletonsLength }).map((_, index) => (
                        <Skeleton
                            key={index}
                            className={cn(
                                "h-3.5 w-2/4 bg-zinc-700",
                                classNameSkeleton,
                            )}
                            style={{
                                width: generateSizePercentage(index),
                            }}
                        />
                    ))}
                </div>
            </div>
        );
    }
    return textarea;
}

export { Textarea };

"use client";

import * as React from "react";

import { Skeleton } from "@/components/ui/skeleton";

import { cn, generateSizePercentage } from "@/lib/utils";

export function SearchItemSkeleton({
    length = 2,
    showIcon = true,
    className,
    classNameSkeleton,
    ...props
}: React.ComponentProps<"div"> & {
    length?: number;
    showIcon?: boolean;
    classNameSkeleton?: string;
}) {
    return (
        <div
            data-slot="search-item-skeleton"
            className={cn(
                "flex w-full items-center gap-2 px-2.5 py-2",
                className,
            )}
            {...props}
        >
            {showIcon && (
                <Skeleton
                    className={cn(
                        "size-4 shrink-0 rounded-full bg-zinc-700",
                        classNameSkeleton,
                    )}
                />
            )}

            <div className="flex w-full flex-col gap-2">
                {Array.from({ length }).map((_, index) => (
                    <Skeleton
                        key={index}
                        className={cn(
                            "h-3.5 w-full bg-zinc-700",
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

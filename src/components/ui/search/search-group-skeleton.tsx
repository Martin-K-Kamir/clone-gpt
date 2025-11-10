"use client";

import { Command as CommandPrimitive } from "cmdk";
import * as React from "react";

import { SearchItemSkeleton } from "./search-item-skeleton";

export function SearchGroupSkeleton({
    length = 4,
    showSkeletonIcon,
    lengthSkeleton,
    classNameSkeleton,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.List> & {
    length?: number;
    showSkeletonIcon?: boolean;
    lengthSkeleton?: number;
    classNameSkeleton?: string;
}) {
    return (
        <CommandPrimitive.Group data-slot="search-group-skeleton" {...props}>
            {Array.from({ length }).map((_, index) => (
                <SearchItemSkeleton
                    key={index}
                    showIcon={showSkeletonIcon}
                    length={lengthSkeleton}
                    classNameSkeleton={classNameSkeleton}
                />
            ))}
        </CommandPrimitive.Group>
    );
}

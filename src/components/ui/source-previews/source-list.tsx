"use client";

import { useQuery } from "@tanstack/react-query";
import { SourceUrlUIPart } from "ai";
import { useMemo } from "react";

import { cn } from "@/lib/utils";

import { getSourcePreviews } from "@/services/get-source-previews";

import { SourceListItem } from "./source-list-item";
import { SourceListLinks } from "./source-list-links";
import { SourceListSkeleton } from "./source-list-skeleton";

type SourceListProps = {
    sources: SourceUrlUIPart[];
    classNameItem?: string;
    classNameSkeleton?: string;
    classNameItemSkeleton?: string;
    classNameLink?: string;
    classNameLinks?: string;
} & React.ComponentProps<"ul">;

export function SourceList({
    sources,
    className,
    classNameItem,
    classNameSkeleton,
    classNameItemSkeleton,
    classNameLinks,
    classNameLink,
    ...props
}: SourceListProps) {
    const sourceUrls = useMemo(
        () => [...new Set(sources.map(resource => resource.url))],
        [sources],
    );

    const { data, isLoading, isError } = useQuery({
        queryKey: ["source-preview", sourceUrls],
        queryFn: () => getSourcePreviews(sourceUrls),
    });

    if (isLoading) {
        return (
            <SourceListSkeleton
                className={cn(className, classNameSkeleton)}
                classNameItemSkeleton={classNameItemSkeleton}
                {...props}
            />
        );
    }

    if (isError || !data) {
        return (
            <SourceListLinks
                sources={sources}
                className={cn(className, classNameLinks)}
                classNameLink={classNameLink}
                {...props}
            />
        );
    }

    return (
        <ul
            className={cn("flex flex-col divide-y divide-zinc-700", className)}
            {...props}
        >
            {data.map(source => (
                <li key={source.url}>
                    <SourceListItem source={source} className={classNameItem} />
                </li>
            ))}
        </ul>
    );
}

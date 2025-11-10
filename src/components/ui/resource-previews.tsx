"use client";

/* eslint-disable @next/next/no-img-element */
import { IconLink } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { SourceUrlUIPart } from "ai";
import { useMemo } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import type { ResourcePreview } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getResourcePreviews } from "@/services/resource";

type ResourcePreviewsProps = {
    resources: SourceUrlUIPart[];
    classNameItem?: string;
    classNameSkeleton?: string;
    classNameItemSkeleton?: string;
    classNameLink?: string;
    classNameLinks?: string;
} & React.ComponentProps<"ul">;

export function ResourcePreviews({
    resources,
    className,
    classNameItem,
    classNameSkeleton,
    classNameItemSkeleton,
    classNameLinks,
    classNameLink,
    ...props
}: ResourcePreviewsProps) {
    const resourceUrls = useMemo(
        () => [...new Set(resources.map(resource => resource.url))],
        [resources],
    );

    const { data, isLoading, isError } = useQuery({
        queryKey: ["resource-preview", resourceUrls],
        queryFn: () => getResourcePreviews(resourceUrls),
    });

    if (isLoading) {
        return (
            <ResourcePreviewsSkeleton
                className={cn(className, classNameSkeleton)}
                classNameItemSkeleton={classNameItemSkeleton}
                {...props}
            />
        );
    }

    if (isError || !data) {
        return (
            <ResourcePreviewsLinks
                resources={resources}
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
            {data.map(resource => (
                <li key={resource.url}>
                    <ResourcePreviewItem
                        resource={resource}
                        className={classNameItem}
                    />
                </li>
            ))}
        </ul>
    );
}

function ResourcePreviewItem({
    resource,
    className,
    ...props
}: {
    resource: ResourcePreview;
} & Omit<React.ComponentProps<"a">, "resource">) {
    return (
        <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                "my-2 flex flex-col space-y-1 rounded-xl p-3 hover:bg-zinc-700",
                className,
            )}
            {...props}
        >
            <span className="flex items-center gap-2">
                <img
                    src={resource.favicon}
                    alt={resource.siteName}
                    className="size-4 rounded-full"
                />
                <span className="text-xs">{resource.siteName}</span>
            </span>

            <span className="mt-1.5 text-pretty font-medium">
                {resource.title}
            </span>

            {resource.description && (
                <span className="text-pretty text-sm text-gray-400">
                    {resource.description}
                </span>
            )}
        </a>
    );
}

function ResourcePreviewsSkeleton({
    className,
    classNameItemSkeleton,
    length = 4,
    ...props
}: React.ComponentProps<"ul"> & {
    classNameItemSkeleton?: string;
    length?: number;
}) {
    return (
        <ul
            className={cn("flex flex-col divide-y divide-zinc-700", className)}
            {...props}
        >
            {Array.from({ length }).map((_, index) => (
                <li key={index}>
                    <ResourcePreviewItemSkeleton
                        className={classNameItemSkeleton}
                    />
                </li>
            ))}
        </ul>
    );
}

function ResourcePreviewItemSkeleton({
    className,
    ...props
}: React.ComponentProps<"div">) {
    return (
        <div className={cn("my-2 flex flex-col p-3", className)} {...props}>
            <div className="flex items-center gap-2">
                <Skeleton className="size-4 rounded-full bg-zinc-700" />
                <Skeleton className="h-4 w-24 rounded-full bg-zinc-700" />
            </div>
            <Skeleton className="mt-2.5 h-5 w-full bg-zinc-700" />
            <Skeleton className="mt-2 h-5 w-full bg-zinc-700" />
            <Skeleton className="mt-2 h-5 w-1/2 bg-zinc-700" />
        </div>
    );
}

function ResourcePreviewsLinks({
    className,
    resources,
    classNameLink,
    ...props
}: React.ComponentProps<"ul"> & {
    resources: SourceUrlUIPart[];
    classNameLink?: string;
}) {
    return (
        <ul
            className={cn("flex flex-col space-y-3 divide-zinc-700", className)}
            {...props}
        >
            {resources.map(resource => (
                <li key={resource.url}>
                    <ResourcePreviewLink
                        href={resource.url}
                        className={classNameLink}
                    >
                        {resource.url}
                    </ResourcePreviewLink>
                </li>
            ))}
        </ul>
    );
}

function ResourcePreviewLink({
    className,
    children,
    ...props
}: React.ComponentProps<"a">) {
    return (
        <a
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
                "flex w-fit items-center gap-1.5 rounded-xl text-sm text-blue-500 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500",
                className,
            )}
            {...props}
        >
            <IconLink className="size-4" />
            {children}
        </a>
    );
}

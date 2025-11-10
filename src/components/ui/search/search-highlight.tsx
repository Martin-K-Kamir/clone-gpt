"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export function SearchHighlight({
    content,
    search,
    classNameHighlight,
    ...props
}: React.ComponentProps<"span"> & {
    content: string;
    search: string;
    classNameHighlight?: string;
}) {
    if (!search || !content) return <span {...props}>{content}</span>;

    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapedSearch})`, "gi");

    const parts = content.split(regex);

    return (
        <span {...props}>
            {parts.map((part, i) => (
                <span key={i}>
                    {regex.test(part) ? (
                        <span
                            className={cn(
                                "font-medium text-zinc-50",
                                classNameHighlight,
                            )}
                        >
                            {part}
                        </span>
                    ) : (
                        part
                    )}
                </span>
            ))}
        </span>
    );
}

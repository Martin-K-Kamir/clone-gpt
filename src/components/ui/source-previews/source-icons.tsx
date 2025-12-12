"use client";

import { type SourceUrlUIPart } from "ai";
import { useMemo } from "react";

import { cn } from "@/lib/utils";

type SourceIconPreview = {
    hostname: string;
    title: string;
    url: string;
    faviconUrl: string;
};

type SourceIconsProps = {
    sources: SourceUrlUIPart[];
    limit?: number;
    classNameIcon?: string;
} & React.ComponentProps<"div">;

export function SourceIcons({
    sources,
    className,
    classNameIcon,
    children,
    limit = 3,
    ...props
}: SourceIconsProps) {
    const sourceIcons = useMemo(() => {
        return sources
            .map(source => {
                try {
                    const { hostname } = new URL(source.url);
                    return {
                        hostname,
                        title: source.title,
                        url: source.url,
                        faviconUrl: `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`,
                    };
                } catch {
                    return null;
                }
            })
            .filter(Boolean)
            .slice(0, limit) as SourceIconPreview[];
    }, [sources, limit]);

    return (
        <div className={cn("flex", className)} {...props}>
            {sourceIcons.map((source, index) => (
                <div
                    key={source.url}
                    className={cn("relative", index > 0 && "-ml-1.5")}
                    style={{ zIndex: sourceIcons.length - index }}
                >
                    <img
                        src={source.faviconUrl}
                        alt={source.title}
                        className={cn(
                            "border-zinc-925 size-5 rounded-full border-2",
                            classNameIcon,
                        )}
                    />
                </div>
            ))}
            {children}
        </div>
    );
}

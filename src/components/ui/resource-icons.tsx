import { SourceUrlUIPart } from "ai";
import { useMemo } from "react";

import { cn } from "@/lib/utils";

type ResourceIconsProps = {
    resources: SourceUrlUIPart[];
    limit?: number;
    classNameIcon?: string;
} & React.ComponentProps<"div">;

export function ResourceIcons({
    resources,
    className,
    limit = 3,
    classNameIcon,
    children,
    ...props
}: ResourceIconsProps) {
    const resourceIcons = useMemo(() => {
        return resources
            .map(resource => {
                try {
                    const { hostname } = new URL(resource.url);
                    return {
                        hostname,
                        title: resource.title,
                        url: resource.url,
                        faviconUrl: `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`,
                    };
                } catch {
                    return null;
                }
            })
            .filter(Boolean)
            .slice(0, limit) as {
            hostname: string;
            title: string;
            url: string;
            faviconUrl: string;
        }[];
    }, [resources, limit]);

    return (
        <div className={cn("flex", className)} {...props}>
            {resourceIcons.map((resource, index) => (
                <div
                    key={resource.url}
                    className={cn("relative", index > 0 && "-ml-1.5")}
                    style={{ zIndex: resourceIcons.length - index }}
                >
                    <img
                        src={resource.faviconUrl}
                        alt={resource.title}
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

import { IconLink } from "@tabler/icons-react";

import { cn } from "@/lib/utils";

export function SourceListLink({
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

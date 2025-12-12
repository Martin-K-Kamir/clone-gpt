import { SourceUrlUIPart } from "ai";

import { cn } from "@/lib/utils";

import { SourceListLink } from "./source-list-link";

type SourceListLinksProps = {
    sources: SourceUrlUIPart[];
    classNameLink?: string;
} & React.ComponentProps<"ul">;

export function SourceListLinks({
    className,
    sources,
    classNameLink,
    ...props
}: SourceListLinksProps) {
    return (
        <ul
            className={cn("flex flex-col space-y-3 divide-zinc-700", className)}
            {...props}
        >
            {sources.map(source => (
                <li key={source.url}>
                    <SourceListLink href={source.url} className={classNameLink}>
                        {source.url}
                    </SourceListLink>
                </li>
            ))}
        </ul>
    );
}

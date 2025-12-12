import type { SourcePreview } from "@/lib/types";
import { cn } from "@/lib/utils";

type SourceListItemProps = {
    source: SourcePreview;
} & React.ComponentProps<"a">;

export function SourceListItem({
    source,
    className,
    ...props
}: SourceListItemProps) {
    return (
        <a
            href={source.url}
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
                    src={source.favicon}
                    alt={source.siteName}
                    className="size-4 rounded-full"
                />
                <span className="text-xs">{source.siteName}</span>
            </span>

            <span className="mt-1.5 text-pretty font-medium">
                {source.title}
            </span>
        </a>
    );
}

import { cn } from "@/lib/utils";

type SearchHighlightProps = {
    content: string;
    search: string;
    classNameHighlight?: string;
} & React.ComponentProps<"span">;

export function SearchHighlight({
    content,
    search,
    classNameHighlight,
    ...props
}: SearchHighlightProps) {
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
                                "font-medium text-yellow-400",
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

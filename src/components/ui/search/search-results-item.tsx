import { IconMessageCircle } from "@tabler/icons-react";

import { SearchHighlight, SearchItem } from "@/components/ui/search";

import { toRelativeDate } from "@/lib/utils";

export type SearchResultsItemResult = {
    id: string;
    title: string;
    snippet?: string;
    updatedAt: string;
    createdAt: string;
    href: string;
};

type SearchResultsItemProps<TResult extends SearchResultsItemResult> = {
    query?: string;
    result: TResult;
} & Omit<React.ComponentProps<typeof SearchItem>, "itemId">;

export function SearchResultsItem<TResult extends SearchResultsItemResult>({
    query,
    result,
    children,
    ...props
}: SearchResultsItemProps<TResult>) {
    const { id, title, snippet, updatedAt, href } = result;

    let content: React.ReactNode = title;

    if (snippet && query) {
        content = (
            <div className="grid w-full grid-cols-[1fr_auto] items-center gap-4">
                <div className="min-w-0 flex-1 overflow-hidden">
                    <div className="truncate">
                        <SearchHighlight content={title} search={query} />
                    </div>
                    <div className="truncate text-xs text-zinc-400">
                        <SearchHighlight content={snippet} search={query} />
                    </div>
                </div>
                <div className="hidden flex-none text-left text-xs font-medium text-zinc-300 group-data-[selected=true]/search-item:block">
                    {toRelativeDate(updatedAt)}
                </div>
            </div>
        );
    }

    return (
        <SearchItem {...props} itemId={id} href={href}>
            <IconMessageCircle />
            {content}
            {children}
        </SearchItem>
    );
}

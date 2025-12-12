import { SearchGroup } from "@/components/ui/search";

import {
    SearchResultsItem,
    type SearchResultsItemResult,
} from "./search-results-item";

type GroupedData<TResult extends SearchResultsItemResult> = {
    [key: string]: TResult[];
};

type SearchResultsListProps<TResult extends SearchResultsItemResult> = {
    data: TResult[] | GroupedData<TResult>;
    query?: string;
    nearEndRef?: React.RefObject<HTMLDivElement | null>;
    nearEndItemOffset?: number;
    onSelect?: (result: TResult) => void;
};

export function SearchResultsList<TResult extends SearchResultsItemResult>({
    data,
    query,
    nearEndRef,
    nearEndItemOffset = 10,
    onSelect,
}: SearchResultsListProps<TResult>) {
    if (Array.isArray(data)) {
        return data.map((result, index) => {
            const isNearEnd =
                nearEndRef && index === data.length - nearEndItemOffset;

            return (
                <SearchResultsItem
                    key={result.id}
                    ref={isNearEnd ? nearEndRef : undefined}
                    query={query}
                    result={result}
                    onSelect={() => onSelect?.(result)}
                />
            );
        });
    }

    return Object.entries(data).map(([category, results]) => (
        <SearchGroup key={category} heading={category}>
            <SearchResultsList data={results} query={query} />
        </SearchGroup>
    ));
}

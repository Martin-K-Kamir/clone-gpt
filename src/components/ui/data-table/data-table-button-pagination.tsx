import {
    IconChevronLeft,
    IconChevronRight,
    IconChevronsLeft,
    IconChevronsRight,
} from "@tabler/icons-react";

import { cn } from "@/lib/utils";

import { DataTableFirstPageButton } from "./data-table-first-page-button";
import { DataTableLastPageButton } from "./data-table-last-page-button";
import { DataTableNextPageButton } from "./data-table-next-page-button";
import { DataTablePrevPageButton } from "./data-table-prev-page-button";

export type DataTableButtonPaginationProps = Partial<{
    onNextPage: () => void;
    onPrevPage: () => void;
    onFirstPage: () => void;
    onLastPage: () => void;
}>;

export function DataTableButtonPagination({
    className,
    onNextPage,
    onPrevPage,
    onFirstPage,
    onLastPage,
    ...props
}: Omit<React.ComponentProps<"div">, "children"> &
    DataTableButtonPaginationProps) {
    return (
        <div
            {...props}
            className={cn("flex items-center space-x-2", className)}
        >
            <DataTableFirstPageButton onClick={onFirstPage}>
                <IconChevronsLeft />
            </DataTableFirstPageButton>
            <DataTablePrevPageButton onClick={onPrevPage}>
                <IconChevronLeft />
            </DataTablePrevPageButton>
            <DataTableNextPageButton onClick={onNextPage}>
                <IconChevronRight />
            </DataTableNextPageButton>
            <DataTableLastPageButton onClick={onLastPage}>
                <IconChevronsRight />
            </DataTableLastPageButton>
        </div>
    );
}

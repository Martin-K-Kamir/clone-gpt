"use client";

import { cn } from "@/lib/utils";

import {
    DataTableButtonPagination,
    type DataTableButtonPaginationProps,
} from "./data-table-button-pagination";
import { DataTablePageCounter } from "./data-table-page-counter";
import { DataTableSizeSelector } from "./data-table-size-selector";
import { useDataTableContext } from "./use-data-table-context";

type DataTablePaginationProps = {
    showButtons?: boolean;
    showSelector?: boolean;
    showCounter?: boolean;
} & Omit<React.ComponentProps<"nav">, "children"> &
    DataTableButtonPaginationProps;

export function DataTablePagination({
    className,
    showButtons = true,
    showSelector = true,
    showCounter = true,
    onNextPage,
    onPrevPage,
    onFirstPage,
    onLastPage,
    ...props
}: DataTablePaginationProps) {
    const { table, options } = useDataTableContext();
    const totalCount = options?.totalCount ?? table.getRowCount();

    if (totalCount === 0) {
        return null;
    }

    return (
        <nav
            role="navigation"
            aria-label="pagination"
            {...props}
            className={cn(
                "flex flex-wrap items-center justify-end gap-4 sm:gap-8",
                className,
            )}
        >
            {showSelector && (
                <div className="flex items-center gap-2">
                    <p className="text-sm text-zinc-200">Rows per page</p>
                    <DataTableSizeSelector />
                </div>
            )}
            {showButtons && (
                <div className="flex items-center gap-4 sm:gap-8">
                    {showCounter && (
                        <DataTablePageCounter className="text-sm" />
                    )}
                    <DataTableButtonPagination
                        onNextPage={onNextPage}
                        onPrevPage={onPrevPage}
                        onFirstPage={onFirstPage}
                        onLastPage={onLastPage}
                    />
                </div>
            )}
        </nav>
    );
}

"use client";

import { useDataTable } from "./data-table";
import { DataTableButton } from "./data-table-button";

export function DataTableLastPageButton({
    children,
    onClick,
    ...props
}: React.ComponentProps<typeof DataTableButton>) {
    const { table, isLoading } = useDataTable();

    return (
        <DataTableButton
            {...props}
            onClick={e => {
                table.setPageIndex(table.getPageCount() - 1);
                onClick?.(e);
            }}
            disabled={!table.getCanNextPage() || isLoading}
        >
            <span className="sr-only">Go to last page</span>
            {children}
        </DataTableButton>
    );
}

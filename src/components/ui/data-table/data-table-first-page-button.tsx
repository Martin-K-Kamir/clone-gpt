"use client";

import { useDataTable } from "./data-table";
import { DataTableButton } from "./data-table-button";

export function DataTableFirstPageButton({
    children,
    onClick,
    ...props
}: React.ComponentProps<typeof DataTableButton>) {
    const { table, isLoading } = useDataTable();

    return (
        <DataTableButton
            {...props}
            onClick={e => {
                table.setPageIndex(0);
                onClick?.(e);
            }}
            disabled={!table.getCanPreviousPage() || isLoading}
        >
            <span className="sr-only">Go to first page</span>
            {children}
        </DataTableButton>
    );
}

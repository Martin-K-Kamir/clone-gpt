"use client";

import { useDataTable } from "./data-table";
import { DataTableButton } from "./data-table-button";

export function DataTableNextPageButton({
    children,
    onClick,
    ...props
}: React.ComponentProps<typeof DataTableButton>) {
    const { table, isLoading } = useDataTable();

    return (
        <DataTableButton
            {...props}
            onClick={e => {
                table.nextPage();
                onClick?.(e);
            }}
            disabled={!table.getCanNextPage() || isLoading}
        >
            <span className="sr-only">Go to next page</span>
            {children}
        </DataTableButton>
    );
}

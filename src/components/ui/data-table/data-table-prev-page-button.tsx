"use client";

import { useDataTable } from "./data-table";
import { DataTableButton } from "./data-table-button";

export function DataTablePrevPageButton({
    children,
    onClick,
    ...props
}: React.ComponentProps<typeof DataTableButton>) {
    const { table, isLoading } = useDataTable();

    return (
        <DataTableButton
            {...props}
            onClick={e => {
                table.previousPage();
                onClick?.(e);
            }}
            disabled={!table.getCanPreviousPage() || isLoading}
        >
            <span className="sr-only">Go to previous page</span>
            {children}
        </DataTableButton>
    );
}

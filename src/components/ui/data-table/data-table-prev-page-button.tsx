"use client";

import { DataTableButton } from "./data-table-button";
import { useDataTableContext } from "./use-data-table-context";

export function DataTablePrevPageButton({
    children,
    onClick,
    ...props
}: React.ComponentProps<typeof DataTableButton>) {
    const { table, isLoading } = useDataTableContext();

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

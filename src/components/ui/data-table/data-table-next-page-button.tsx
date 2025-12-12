"use client";

import { DataTableButton } from "./data-table-button";
import { useDataTableContext } from "./use-data-table-context";

export function DataTableNextPageButton({
    children,
    onClick,
    ...props
}: React.ComponentProps<typeof DataTableButton>) {
    const { table, isLoading } = useDataTableContext();

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

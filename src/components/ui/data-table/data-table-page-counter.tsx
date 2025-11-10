"use client";

import { cn } from "@/lib/utils";

import { useDataTable } from "./data-table";

export function DataTablePageCounter({
    className,
    ...props
}: Omit<React.ComponentProps<"div">, "children">) {
    const { table } = useDataTable();

    return (
        <div {...props} className={cn("text-sm text-zinc-200", className)}>
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
        </div>
    );
}

"use client";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { useDataTable } from "./data-table";

export function DataTableSizeSelector({
    pageSizes = [10, 20, 30, 40, 50],
}: {
    pageSizes?: number[];
}) {
    const { table } = useDataTable();

    return (
        <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={value => {
                table.setPageSize(Number(value));
            }}
        >
            <SelectTrigger className="w-18 max-h-8">
                <SelectValue
                    placeholder={table.getState().pagination.pageSize}
                />
            </SelectTrigger>
            <SelectContent side="bottom" className="min-w-26">
                {pageSizes.map(pageSize => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

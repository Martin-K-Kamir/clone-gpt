"use client";

import {
    type ColumnDef,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { createContext, useContext } from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */

type DataTableOptions = Partial<{
    pageSize: number;
    totalCount: number;
    manualPagination: boolean;
}>;

type DataTableProps<TData, TValue> = {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    children: React.ReactNode;
    isLoading?: boolean;
    className?: string;
    options?: DataTableOptions;
    error: Error | null;
};

type DataTableContextValue<TData> = {
    table: ReturnType<typeof useReactTable<TData>>;
} & Omit<DataTableProps<TData, any>, "data" | "children">;

const DataTableContext = createContext<DataTableContextValue<any> | null>(null);

export const useDataTable = <TData,>() => {
    const context = useContext(
        DataTableContext,
    ) as DataTableContextValue<TData> | null;

    if (!context) {
        throw new Error(
            "useDataTable must be used within a <DataTableProvider/>",
        );
    }

    return context;
};

export function DataTable<TData extends Record<string, unknown>, TValue>({
    columns,
    data,
    children,
    options,
    isLoading,
    error,
}: DataTableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: options?.manualPagination ?? false,
        rowCount: options?.totalCount,
        initialState: {
            pagination: {
                pageSize: options?.pageSize ?? 10,
            },
        },
    });

    return (
        <DataTableContext value={{ table, columns, options, isLoading, error }}>
            {children}
        </DataTableContext>
    );
}

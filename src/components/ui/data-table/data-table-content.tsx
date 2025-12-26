"use client";

import { flexRender } from "@tanstack/react-table";

import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { cn } from "@/lib/utils";

import { useDataTableContext } from "./use-data-table-context";

export function DataTableContent({
    noResultsMessage = "No results",
    className,
    renderNoResults,
    renderError,
    errorMessage,
    classNameWrapper,
    classNameNoResults,
    classNameError,
    ...props
}: React.ComponentProps<typeof Table> & {
    renderNoResults?: React.ReactNode;
    renderError?: React.ReactNode;
    noResultsMessage?: string;
    errorMessage?: string;
    classNameWrapper?: string;
    classNameError?: string;
    classNameNoResults?: string;
}) {
    const { table, columns, isLoading, options, error } = useDataTableContext();

    let bodyContent: React.ReactNode;

    if (error) {
        bodyContent = (
            <TableRow>
                {renderError ?? (
                    <TableCell
                        colSpan={columns.length}
                        className={cn(
                            "h-24 text-center font-medium text-rose-400",
                            classNameError,
                        )}
                    >
                        {errorMessage ?? error.message}
                    </TableCell>
                )}
            </TableRow>
        );
    }

    if (!error && isLoading) {
        bodyContent = Array.from({ length: options?.pageSize ?? 10 }).map(
            (_, rowIndex) => (
                <TableRow key={rowIndex}>
                    {columns.map((column, columnIndex) => (
                        <TableCell
                            key={column.id}
                            className={column.meta?.className}
                        >
                            {column.meta?.skeleton?.(rowIndex, columnIndex) ?? (
                                <Skeleton className="h-4 w-44" />
                            )}
                        </TableCell>
                    ))}
                </TableRow>
            ),
        );
    }

    if (!error && table.getRowModel().rows?.length > 0) {
        bodyContent = table.getRowModel().rows.map(row => (
            <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
            >
                {row.getVisibleCells().map(cell => (
                    <TableCell
                        key={cell.id}
                        className={cell.column.columnDef.meta?.className}
                    >
                        {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                        )}
                    </TableCell>
                ))}
            </TableRow>
        ));
    }

    if (!bodyContent) {
        bodyContent = (
            <TableRow>
                {renderNoResults ?? (
                    <TableCell
                        colSpan={columns.length}
                        className={cn(
                            "h-24 text-center font-medium",
                            classNameNoResults,
                        )}
                        data-testid="data-table-content-no-results"
                    >
                        {noResultsMessage}
                    </TableCell>
                )}
            </TableRow>
        );
    }

    return (
        <div className={cn(classNameWrapper)}>
            <Table className={className} {...props}>
                <TableHeader>
                    {table.getHeaderGroups().map(headerGroup => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map(header => {
                                return (
                                    <TableHead
                                        key={header.id}
                                        className={
                                            header.column.columnDef.meta
                                                ?.className
                                        }
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef
                                                      .header,
                                                  header.getContext(),
                                              )}
                                    </TableHead>
                                );
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>{bodyContent}</TableBody>
            </Table>
        </div>
    );
}

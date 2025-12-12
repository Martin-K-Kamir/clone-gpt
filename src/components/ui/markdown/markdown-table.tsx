"use client";

import { IconCheck, IconCopy, IconDownload } from "@tabler/icons-react";
import React, { useRef } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { cn } from "@/lib/utils";

import { useCopyTableToClipboard } from "@/hooks/use-copy-table-to-clipboard";
import { useDownloadTableAsCSV } from "@/hooks/use-download-table-as-csv";
import { useDownloadTableAsXLSX } from "@/hooks/use-download-table-as-xlsx";

export function MarkdownTable({
    children,
    className,
    ...props
}: React.ComponentProps<"table">) {
    const tableRef = useRef<HTMLTableElement>(null);
    const { copied, copyTable } = useCopyTableToClipboard(tableRef, {
        onError: message => {
            toast.error(message);
        },
    });
    const { downloadTableAsCSV } = useDownloadTableAsCSV(tableRef, {
        filename: "table-data",
    });
    const { downloadTableAsXLSX } = useDownloadTableAsXLSX(tableRef, {
        filename: "table-data",
    });

    return (
        <div className="group/table relative space-y-2">
            <div className="flex justify-end">
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={copyTable}
                    tooltip="Copy Table"
                    tooltipContentProps={{
                        side: "bottom",
                        sideOffset: 5,
                        className: "bg-zinc-800",
                    }}
                >
                    <span className="sr-only">
                        {copied ? "Copied Table" : "Copy Table"}
                    </span>
                    {copied ? (
                        <IconCheck className="size-4" />
                    ) : (
                        <IconCopy className="size-4" />
                    )}
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            tooltip="Download Table"
                            tooltipContentProps={{
                                side: "bottom",
                                sideOffset: 5,
                                className: "bg-zinc-800",
                            }}
                        >
                            <span className="sr-only">Download Table</span>
                            <IconDownload className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        onCloseAutoFocus={e => {
                            e.preventDefault();
                        }}
                    >
                        <DropdownMenuItem onClick={downloadTableAsCSV}>
                            Download as CSV
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={downloadTableAsXLSX}>
                            Download as Excel
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="overflow-x-auto">
                <table
                    className={cn(
                        "mb-6 mt-0 min-w-full border-collapse border border-zinc-700",
                        className,
                    )}
                    ref={tableRef}
                    {...props}
                >
                    {children}
                </table>
            </div>
        </div>
    );
}

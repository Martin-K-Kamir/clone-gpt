"use client";

import { useCallback } from "react";

import { FILE_EXTENSION, MIME_TYPE } from "@/lib/constants";
import {
    downloadFile,
    extractTableData,
    tableDataToCSV,
    validateTableElement,
} from "@/lib/utils";

type UseDownloadTableAsCSVOptions = Partial<{
    filename?: string;
    delimiter?: string;
}>;

export function useDownloadTableAsCSV(
    tableRef: React.RefObject<HTMLTableElement | null>,
    options?: UseDownloadTableAsCSVOptions,
) {
    const { filename = "table", delimiter = "," } = options || {};

    const downloadTableAsCSV = useCallback(() => {
        const table = validateTableElement(tableRef);
        if (!table) return false;

        try {
            const tableData = extractTableData(table);

            const csvContent = tableDataToCSV(tableData, delimiter);

            return downloadFile(
                csvContent,
                `${filename}${FILE_EXTENSION.CSV}`,
                MIME_TYPE.CSV,
            );
        } catch {
            return false;
        }
    }, [tableRef, filename, delimiter]);

    return { downloadTableAsCSV };
}

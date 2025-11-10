"use client";

import { useCallback } from "react";
import * as XLSX from "xlsx";

import { FILE_EXTENSION, MIME_TYPE } from "@/lib/constants";
import {
    downloadFile,
    extractTableData,
    validateTableElement,
} from "@/lib/utils";

type UseDownloadTableAsXLSXOptions = Partial<{
    filename?: string;
    sheetName?: string;
}>;

export function useDownloadTableAsXLSX(
    tableRef: React.RefObject<HTMLTableElement | null>,
    options?: UseDownloadTableAsXLSXOptions,
) {
    const { filename = "table-data", sheetName = "Sheet1" } = options || {};

    const downloadTableAsXLSX = useCallback(() => {
        const table = validateTableElement(tableRef);
        if (!table) return false;

        try {
            const worksheetData = extractTableData(table);

            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

            const excelBuffer = XLSX.write(workbook, {
                bookType: "xlsx",
                type: "array",
            });

            return downloadFile(
                excelBuffer,
                `${filename}${FILE_EXTENSION.XLSX}`,
                MIME_TYPE.XLSX,
            );
        } catch {
            return false;
        }
    }, [tableRef, filename, sheetName]);

    return { downloadTableAsXLSX };
}

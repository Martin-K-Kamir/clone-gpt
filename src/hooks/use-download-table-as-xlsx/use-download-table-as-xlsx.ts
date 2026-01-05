"use client";

import ExcelJS from "exceljs";
import { useCallback } from "react";

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

    const downloadTableAsXLSX = useCallback(async () => {
        const table = validateTableElement(tableRef);
        if (!table) return false;

        try {
            const worksheetData = extractTableData(table);

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet(sheetName);

            worksheetData.forEach(row => {
                worksheet.addRow(row);
            });

            const excelBuffer = await workbook.xlsx.writeBuffer();

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

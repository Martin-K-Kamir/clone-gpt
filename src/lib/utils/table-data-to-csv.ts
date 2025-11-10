import { escapeCSVContent } from "./escape-csv-content";

export function tableDataToCSV(
    tableData: string[][],
    delimiter: string = ",",
): string {
    return tableData
        .map(row =>
            row.map(cell => escapeCSVContent(cell, delimiter)).join(delimiter),
        )
        .join("\n");
}

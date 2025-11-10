export function extractTableData(table: HTMLTableElement): string[][] {
    const rows = Array.from(table.querySelectorAll("tr"));

    return rows.map(row => {
        const cells = Array.from(row.querySelectorAll("th, td"));
        return cells.map(cell => cell.textContent?.trim() || "");
    });
}

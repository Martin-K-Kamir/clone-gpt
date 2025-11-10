export function validateTableElement(
    tableRef: React.RefObject<HTMLTableElement | null>,
): HTMLTableElement | null {
    if (!tableRef.current) {
        console.error("No table element found");
        return null;
    }
    return tableRef.current;
}

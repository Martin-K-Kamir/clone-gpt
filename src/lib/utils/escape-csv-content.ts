export function escapeCSVContent(text: string, delimiter: string): string {
    // Escape quotes and wrap in quotes if contains delimiter or quotes
    if (text.includes(delimiter) || text.includes('"') || text.includes("\n")) {
        return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
}

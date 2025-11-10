export function toISOString(date: Date | string): string {
    if (typeof date === "string") {
        const parsed = Date.parse(date);
        if (isNaN(parsed)) {
            throw new Error(`Invalid date string: ${date}`);
        }
        return new Date(parsed).toISOString();
    }
    return date.toISOString();
}

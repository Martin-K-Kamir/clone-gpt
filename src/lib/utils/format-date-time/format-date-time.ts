import { format } from "date-fns";

export function formatDateTime(date: string | Date) {
    return format(
        date instanceof Date ? date : new Date(date),
        "MMMM d 'at' h:mm a",
    );
}

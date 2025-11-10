import { format } from "date-fns";
import { isToday } from "date-fns/isToday";
import { isYesterday } from "date-fns/isYesterday";

export function toRelativeDate(date: Date | string | number): string {
    const dateObj =
        typeof date === "string" || typeof date === "number"
            ? new Date(date)
            : date;

    const now = new Date();

    if (isToday(dateObj)) {
        return "Today";
    }

    if (isYesterday(dateObj)) {
        return "Yesterday";
    }

    if (dateObj.getFullYear() === now.getFullYear()) {
        return format(dateObj, "d MMM");
    } else {
        return format(dateObj, "d MMM yyyy");
    }
}

import { matchesShortcut } from "@/lib/utils/matches-shortcut";
import type { NormalizedShortcut } from "@/lib/utils/parse-shortcut";

export function shouldTriggerShortcut(
    event: KeyboardEvent,
    parsedShortcuts: NormalizedShortcut[],
): boolean {
    return parsedShortcuts.some(shortcut => matchesShortcut(event, shortcut));
}

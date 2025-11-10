import { matchesShortcut } from "./matches-shortcut";
import type { NormalizedShortcut } from "./parse-shortcut";

export function shouldTriggerShortcut(
    event: KeyboardEvent,
    parsedShortcuts: NormalizedShortcut[],
): boolean {
    return parsedShortcuts.some(shortcut => matchesShortcut(event, shortcut));
}

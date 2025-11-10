import type { NormalizedShortcut } from "./parse-shortcut";

export function matchesShortcut(
    event: KeyboardEvent,
    shortcut: NormalizedShortcut,
): boolean {
    if (!event || !event.key) return false;

    return (
        event.key.toLowerCase() === shortcut.key &&
        event.metaKey === shortcut.metaKey &&
        event.shiftKey === shortcut.shiftKey &&
        event.ctrlKey === shortcut.ctrlKey &&
        event.altKey === shortcut.altKey
    );
}

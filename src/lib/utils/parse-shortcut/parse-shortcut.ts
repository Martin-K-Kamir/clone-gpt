export type NormalizedShortcut = {
    key: string;
    metaKey: boolean;
    shiftKey: boolean;
    ctrlKey: boolean;
    altKey: boolean;
};

const MODIFIER_MAP: Record<string, keyof Omit<NormalizedShortcut, "key">> = {
    "⌘": "metaKey",
    Cmd: "metaKey",
    Ctrl: "ctrlKey",
    Control: "ctrlKey",
    "⇧": "shiftKey",
    Shift: "shiftKey",
    Alt: "altKey",
    Option: "altKey",
};

export function parseShortcut(shortcut: string): NormalizedShortcut {
    const parts = shortcut.split(/[\s+]+/);
    const result: NormalizedShortcut = {
        key: "",
        metaKey: false,
        shiftKey: false,
        ctrlKey: false,
        altKey: false,
    };

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const mod = MODIFIER_MAP[part];
        if (mod) {
            result[mod] = true;
        } else {
            result.key = part.toLowerCase();
        }
    }

    return result;
}

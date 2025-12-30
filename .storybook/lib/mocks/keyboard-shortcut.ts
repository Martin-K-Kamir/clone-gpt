import { OPERATING_SYSTEM } from "@/lib/constants";

export const MOCK_CMD_K_SHORTCUTS = {
    [OPERATING_SYSTEM.MACOS]: "⌘ K",
    [OPERATING_SYSTEM.WINDOWS]: "Ctrl K",
    [OPERATING_SYSTEM.LINUX]: "Ctrl K",
} as const;

export const MOCK_SHIFT_S_SHORTCUTS = {
    [OPERATING_SYSTEM.WINDOWS]: "Ctrl Shift S",
    [OPERATING_SYSTEM.MACOS]: "⌘ Shift S",
} as const;

export const MOCK_COMPLEX_SHORTCUTS = {
    [OPERATING_SYSTEM.MACOS]: "⌘ Shift Option K",
    [OPERATING_SYSTEM.WINDOWS]: "Ctrl Shift Alt K",
} as const;

export const MOCK_ALL_PLATFORMS_SHORTCUTS = {
    [OPERATING_SYSTEM.MACOS]: "⌘ K",
    [OPERATING_SYSTEM.WINDOWS]: "Ctrl K",
    [OPERATING_SYSTEM.LINUX]: "Ctrl K",
    [OPERATING_SYSTEM.ANDROID]: "Ctrl K",
    [OPERATING_SYSTEM.IOS]: "⌘ K",
} as const;

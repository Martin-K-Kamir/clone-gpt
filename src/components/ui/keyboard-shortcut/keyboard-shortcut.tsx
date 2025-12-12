"use client";

import { useEffect, useMemo, useState } from "react";

import { AnyComponent } from "@/components/ui/any-component";

import type { OperatingSystem } from "@/lib/types";
import {
    getOperatingSystem,
    parseShortcut,
    shouldTriggerShortcut,
} from "@/lib/utils";

import { useEventListener } from "@/hooks";

export type KeyboardShortcutProps = {
    platformDetection?: "default" | (() => OperatingSystem | null);
    shortcuts: Partial<Record<OperatingSystem, string>>;
    onShortcut?: (
        event: KeyboardEvent,
        os: OperatingSystem | null,
        shortcut: string | null,
    ) => void;
} & Omit<React.ComponentProps<typeof AnyComponent>, "children">;

export function KeyboardShortcut({
    shortcuts,
    platformDetection = "default",
    as: Comp = "span",
    onShortcut,
    ...props
}: KeyboardShortcutProps) {
    const [os, setOs] = useState<OperatingSystem | null>(null);

    const parsedShortcuts = useMemo(() => {
        const allShortcuts = Object.values(shortcuts);
        return allShortcuts.filter(Boolean).map(parseShortcut);
    }, [shortcuts]);

    useEventListener("keydown", event => {
        if (shouldTriggerShortcut(event, parsedShortcuts)) {
            event.preventDefault();
            event.stopPropagation();
            onShortcut?.(event, os, os ? (shortcuts[os] ?? null) : null);
        }
    });

    useEffect(() => {
        setOs(() => {
            if (platformDetection === "default") {
                return getOperatingSystem();
            }
            if (typeof platformDetection === "function") {
                return platformDetection();
            }
            return null;
        });
    }, [platformDetection]);

    if (!os) {
        return null;
    }

    return <Comp {...props}>{shortcuts[os]}</Comp>;
}

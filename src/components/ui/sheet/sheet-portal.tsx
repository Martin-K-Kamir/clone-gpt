"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { useSheetContext } from "./sheet";

export function SheetPortal({
    children,
    container,
}: {
    children: React.ReactNode;
    container?: HTMLElement;
}) {
    const { open } = useSheetContext();
    const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

    useEffect(() => {
        if (typeof document === "undefined" || !open) {
            return;
        }

        setMountNode(container ?? document.body);
    }, [container, open]);

    if (!mountNode) {
        return null;
    }

    return createPortal(children, mountNode);
}

"use client";

import * as React from "react";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import { SHEET_CONTROL_MODE, SHEET_VIEW_STATE } from "./constants";
import type { SheetControlMode, SheetViewState } from "./types";

const SheetContext = createContext<{
    open: boolean;
    view: SheetViewState;
    handleOpen: (open: boolean) => void;
    handleOpenChange: (open: boolean) => void;
    handleViewChange: (view: SheetViewState) => void;
} | null>(null);

export function useSheetContext() {
    const context = useContext(SheetContext);
    if (!context) {
        throw new Error("useSheetContext must be used within a SheetContext");
    }
    return context;
}

export function Sheet({
    open,
    defaultOpen,
    view,
    defaultView,
    children,
    control = SHEET_CONTROL_MODE.VIEW,
    onChange,
    onViewChange,
    onOpenChange,
}: {
    control?: SheetControlMode;
    open?: boolean;
    defaultOpen?: boolean;
    view?: SheetViewState;
    defaultView?: SheetViewState;
    children: React.ReactNode;
    onChange?: (open: boolean) => void;
    onViewChange?: (view: SheetViewState) => void;
    onOpenChange?: (open: boolean) => void;
}) {
    const [internalOpen, setInternalOpen] = useState(defaultOpen ?? false);
    const [internalView, setInternalView] = useState(
        defaultView ?? SHEET_VIEW_STATE.CLOSED,
    );

    const isControlledOpen = open !== undefined;
    const isControlledView = view !== undefined;

    const resolvedOpen = isControlledOpen ? open! : internalOpen;
    const resolvedView = isControlledView ? view! : internalView;

    useEffect(() => {
        if (isControlledOpen && open !== undefined) {
            setInternalOpen(open);
        }
    }, [isControlledOpen, open]);

    useEffect(() => {
        if (isControlledView && view !== undefined) {
            setInternalView(view);
        }
    }, [isControlledView, view]);

    const handleOpenChange = useCallback(
        (open: boolean) => {
            if (!isControlledOpen) {
                setInternalOpen(open);
            }
            onChange?.(open);
            onOpenChange?.(open);
        },
        [isControlledOpen, onChange, onOpenChange],
    );

    const handleViewChange = useCallback(
        (view: SheetViewState) => {
            if (!isControlledView) {
                setInternalView(view);
            }
            onChange?.(view === SHEET_VIEW_STATE.OPEN ? true : false);
            onViewChange?.(view);
        },
        [isControlledView, onChange, onViewChange],
    );

    const handleOpen = useCallback(
        (open: boolean) => {
            if (control === SHEET_CONTROL_MODE.OPEN) {
                handleOpenChange(open);
            } else if (control === SHEET_CONTROL_MODE.VIEW) {
                handleViewChange(
                    open ? SHEET_VIEW_STATE.OPEN : SHEET_VIEW_STATE.CLOSED,
                );
            } else if (control === SHEET_CONTROL_MODE.BOTH) {
                handleOpenChange(open);
                handleViewChange(
                    open ? SHEET_VIEW_STATE.OPEN : SHEET_VIEW_STATE.CLOSED,
                );
            }
        },
        [control, handleOpenChange, handleViewChange],
    );

    const value = useMemo(
        () => ({
            open: resolvedOpen,
            view: resolvedView,
            handleOpen,
            handleOpenChange,
            handleViewChange,
        }),
        [
            resolvedOpen,
            resolvedView,
            handleOpen,
            handleOpenChange,
            handleViewChange,
        ],
    );

    return <SheetContext value={value}>{children}</SheetContext>;
}

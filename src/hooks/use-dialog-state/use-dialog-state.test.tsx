import { act, renderHook, waitFor } from "@testing-library/react";
import { createContext, useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DialogsContext } from "@/components/ui/dialog";

import { useDialogState } from "./use-dialog-state";

vi.mock("@/components/ui/dialog", () => {
    const DialogsContext = createContext<{
        openDialogId: string;
        setOpenDialogId: (openDialogId: string) => void;
    }>({
        openDialogId: "",
        setOpenDialogId: () => {},
    });

    return {
        DialogsContext,
    };
});

function DialogProvider({
    children,
    initialOpenDialogId = "",
}: {
    children: React.ReactNode;
    initialOpenDialogId?: string;
}) {
    const [openDialogId, setOpenDialogId] = useState(initialOpenDialogId);

    return (
        <DialogsContext.Provider value={{ openDialogId, setOpenDialogId }}>
            {children}
        </DialogsContext.Provider>
    );
}

describe("useDialogState", () => {
    beforeEach(() => {
        document.body.style.pointerEvents = "";
        vi.useFakeTimers();
    });

    afterEach(() => {
        document.body.style.pointerEvents = "";
        vi.clearAllTimers();
        vi.useRealTimers();
    });

    it("returns defaultOpen as initial open state", () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <DialogProvider>{children}</DialogProvider>
        );

        const { result } = renderHook(
            () => useDialogState({ defaultOpen: true }),
            { wrapper },
        );

        expect(result.current[0]).toBe(true);
        expect(typeof result.current[1]).toBe("function");
    });

    it("returns undefined as initial open state when defaultOpen is not provided", () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <DialogProvider>{children}</DialogProvider>
        );

        const { result } = renderHook(() => useDialogState({}), { wrapper });

        expect(result.current[0]).toBeUndefined();
    });

    it("uses controlled open state when provided", () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <DialogProvider>{children}</DialogProvider>
        );

        const { result, rerender } = renderHook(
            ({ open }) => useDialogState({ open }),
            {
                wrapper,
                initialProps: { open: true },
            },
        );

        expect(result.current[0]).toBe(true);

        rerender({ open: false });

        expect(result.current[0]).toBe(false);
    });

    it("calls onOpenChange when state changes", () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <DialogProvider>{children}</DialogProvider>
        );

        const onOpenChange = vi.fn();

        const { result } = renderHook(() => useDialogState({ onOpenChange }), {
            wrapper,
        });

        result.current[1](true);

        expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    it("updates internal state when not controlled", () => {
        vi.useRealTimers();

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <DialogProvider>{children}</DialogProvider>
        );

        const { result } = renderHook(
            () => useDialogState({ defaultOpen: false }),
            { wrapper },
        );

        expect(result.current[0]).toBe(false);

        act(() => {
            result.current[1](true);
        });

        expect(result.current[0]).toBe(true);

        vi.useFakeTimers();
    });

    it("uses openDialogId from context when dialogId is provided", () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <DialogProvider initialOpenDialogId="dialog-1">
                {children}
            </DialogProvider>
        );

        const { result } = renderHook(
            () => useDialogState({ dialogId: "dialog-1" }),
            { wrapper },
        );

        expect(result.current[0]).toBe(true);
    });

    it("returns false when dialogId does not match openDialogId", () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <DialogProvider initialOpenDialogId="dialog-1">
                {children}
            </DialogProvider>
        );

        const { result } = renderHook(
            () => useDialogState({ dialogId: "dialog-2" }),
            { wrapper },
        );

        expect(result.current[0]).toBe(false);
    });

    it("updates context when dialogId is provided and opened", () => {
        vi.useRealTimers();

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <DialogProvider>{children}</DialogProvider>
        );

        const { result } = renderHook(
            () => useDialogState({ dialogId: "dialog-1" }),
            { wrapper },
        );

        act(() => {
            result.current[1](true);
        });

        expect(result.current[0]).toBe(true);

        vi.useFakeTimers();
    });

    it("clears context when dialogId is provided and closed", () => {
        vi.useRealTimers();

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <DialogProvider initialOpenDialogId="dialog-1">
                {children}
            </DialogProvider>
        );

        const { result } = renderHook(
            () => useDialogState({ dialogId: "dialog-1" }),
            { wrapper },
        );

        expect(result.current[0]).toBe(true);

        act(() => {
            result.current[1](false);
        });

        expect(result.current[0]).toBe(false);

        vi.useFakeTimers();
    });

    it("clears pointer events when dialog closes", async () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <DialogProvider>{children}</DialogProvider>
        );

        document.body.style.pointerEvents = "none";

        const { result } = renderHook(
            () => useDialogState({ defaultOpen: true }),
            { wrapper },
        );

        act(() => {
            result.current[1](false);
            vi.advanceTimersByTime(200);
        });

        expect(document.body.style.pointerEvents).toBe("");
    });

    it("does not clear pointer events if they are not set to none", () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <DialogProvider>{children}</DialogProvider>
        );

        document.body.style.pointerEvents = "auto";

        const { result } = renderHook(
            () => useDialogState({ defaultOpen: true }),
            { wrapper },
        );

        result.current[1](false);

        expect(document.body.style.pointerEvents).toBe("auto");
    });
});

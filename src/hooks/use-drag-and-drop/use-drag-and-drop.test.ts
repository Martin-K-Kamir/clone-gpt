import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useDragAndDrop } from "./use-drag-and-drop";

const createMockDragEvent = (
    type: string,
    props: { currentTarget?: HTMLElement; relatedTarget?: Node | null } = {},
): React.DragEvent => {
    const event = new Event(type, {
        bubbles: true,
        cancelable: true,
    }) as unknown as React.DragEvent;

    Object.defineProperties(event, {
        currentTarget: {
            value: props.currentTarget || null,
            configurable: true,
        },
        relatedTarget: {
            value: props.relatedTarget || null,
            configurable: true,
        },
        preventDefault: { value: vi.fn(), configurable: true },
        stopPropagation: { value: vi.fn(), configurable: true },
    });

    return event;
};

describe("useDragAndDrop", () => {
    let element: HTMLDivElement;

    beforeEach(() => {
        element = document.createElement("div");
        document.body.appendChild(element);
    });

    afterEach(() => {
        if (element.parentNode) {
            document.body.removeChild(element);
        }
    });

    it("returns initial state and event handlers", () => {
        const { result } = renderHook(() => useDragAndDrop());

        expect(result.current.isDragOver).toBe(false);
        expect(typeof result.current.handleDragEnter).toBe("function");
        expect(typeof result.current.handleDragOver).toBe("function");
        expect(typeof result.current.handleDragLeave).toBe("function");
        expect(typeof result.current.handleDrop).toBe("function");
    });

    it("sets isDragOver to true on drag enter and false on drop", async () => {
        const { result } = renderHook(() => useDragAndDrop());

        result.current.handleDragEnter(
            createMockDragEvent("dragenter", { currentTarget: element }),
        );

        await waitFor(() => {
            expect(result.current.isDragOver).toBe(true);
        });

        result.current.handleDrop(
            createMockDragEvent("drop", { currentTarget: element }),
        );

        await waitFor(() => {
            expect(result.current.isDragOver).toBe(false);
        });
    });

    it("calls callbacks on drag events", () => {
        const onDragEnter = vi.fn();
        const onDragOver = vi.fn();
        const onDragLeave = vi.fn();
        const onDrop = vi.fn();

        const { result } = renderHook(() =>
            useDragAndDrop({ onDragEnter, onDragOver, onDragLeave, onDrop }),
        );

        const enterEvent = createMockDragEvent("dragenter", {
            currentTarget: element,
        });
        result.current.handleDragEnter(enterEvent);
        expect(onDragEnter).toHaveBeenCalledWith(enterEvent);

        const overEvent = createMockDragEvent("dragover", {
            currentTarget: element,
        });
        result.current.handleDragOver(overEvent);
        expect(onDragOver).toHaveBeenCalledWith(overEvent);

        const leaveEvent = createMockDragEvent("dragleave", {
            currentTarget: element,
            relatedTarget: null,
        });
        result.current.handleDragLeave(leaveEvent);
        expect(onDragLeave).toHaveBeenCalledWith(leaveEvent);

        const dropEvent = createMockDragEvent("drop", {
            currentTarget: element,
        });
        result.current.handleDrop(dropEvent);
        expect(onDrop).toHaveBeenCalledWith(dropEvent);
    });

    it("does not set isDragOver to false when drag leaves to child element", async () => {
        const { result } = renderHook(() => useDragAndDrop());

        result.current.handleDragEnter(
            createMockDragEvent("dragenter", { currentTarget: element }),
        );

        await waitFor(() => {
            expect(result.current.isDragOver).toBe(true);
        });

        const childElement = document.createElement("div");
        element.appendChild(childElement);

        result.current.handleDragLeave(
            createMockDragEvent("dragleave", {
                currentTarget: element,
                relatedTarget: childElement,
            }),
        );

        expect(result.current.isDragOver).toBe(true);
    });

    it("sets isDragOver to false when drag leaves to outside element", async () => {
        const { result } = renderHook(() => useDragAndDrop());

        result.current.handleDragEnter(
            createMockDragEvent("dragenter", { currentTarget: element }),
        );

        await waitFor(() => {
            expect(result.current.isDragOver).toBe(true);
        });

        const outsideElement = document.createElement("div");

        result.current.handleDragLeave(
            createMockDragEvent("dragleave", {
                currentTarget: element,
                relatedTarget: outsideElement,
            }),
        );

        await waitFor(() => {
            expect(result.current.isDragOver).toBe(false);
        });
    });
});

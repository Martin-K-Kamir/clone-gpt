import { renderHook, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useInView } from "./use-in-view";

describe("useInView", () => {
    let mockIntersectionObserver: {
        observe: ReturnType<typeof vi.fn>;
        disconnect: ReturnType<typeof vi.fn>;
        unobserve: ReturnType<typeof vi.fn>;
    };
    let MockIntersectionObserver: new (
        callback: IntersectionObserverCallback,
        options?: IntersectionObserverInit,
    ) => typeof mockIntersectionObserver;
    let intersectionCallback: IntersectionObserverCallback | null = null;

    beforeEach(() => {
        mockIntersectionObserver = {
            observe: vi.fn(),
            disconnect: vi.fn(),
            unobserve: vi.fn(),
        };

        MockIntersectionObserver = vi.fn(function (
            callback: IntersectionObserverCallback,
        ) {
            intersectionCallback = callback;
            return mockIntersectionObserver;
        }) as unknown as new (
            callback: IntersectionObserverCallback,
            options?: IntersectionObserverInit,
        ) => typeof mockIntersectionObserver;

        global.IntersectionObserver =
            MockIntersectionObserver as unknown as typeof IntersectionObserver;
    });

    afterEach(() => {
        intersectionCallback = null;
        vi.clearAllMocks();
        delete (
            global as { IntersectionObserver?: typeof IntersectionObserver }
        ).IntersectionObserver;
    });

    const triggerIntersection = (
        isIntersecting: boolean,
        entry: Partial<IntersectionObserverEntry> = {},
    ) => {
        if (intersectionCallback) {
            intersectionCallback(
                [
                    {
                        isIntersecting,
                        intersectionRatio: isIntersecting ? 1 : 0,
                        boundingClientRect: {} as DOMRectReadOnly,
                        rootBounds: null,
                        target: document.createElement("div"),
                        time: Date.now(),
                        ...entry,
                    } as IntersectionObserverEntry,
                ],
                {} as IntersectionObserver,
            );
        }
    };

    it("returns false initially", () => {
        const ref = createRef<HTMLDivElement>();
        const element = document.createElement("div");
        ref.current = element;

        const { result } = renderHook(() => useInView(ref));

        expect(result.current).toBe(false);
    });

    it("observes element when ref is provided", () => {
        const ref = createRef<HTMLDivElement>();
        const element = document.createElement("div");
        ref.current = element;

        renderHook(() => useInView(ref));

        expect(mockIntersectionObserver.observe).toHaveBeenCalledWith(element);
    });

    it("does not observe when ref is null", () => {
        const ref = createRef<HTMLDivElement>();

        renderHook(() => useInView(ref));

        expect(mockIntersectionObserver.observe).not.toHaveBeenCalled();
    });

    it("sets inView to true when element intersects", async () => {
        const ref = createRef<HTMLDivElement>();
        const element = document.createElement("div");
        ref.current = element;

        const { result } = renderHook(() => useInView(ref));

        triggerIntersection(true);

        await waitFor(() => {
            expect(result.current).toBe(true);
        });
    });

    it("sets inView to false when element does not intersect", async () => {
        const ref = createRef<HTMLDivElement>();
        const element = document.createElement("div");
        ref.current = element;

        const { result } = renderHook(() => useInView(ref));

        triggerIntersection(true);

        await waitFor(() => {
            expect(result.current).toBe(true);
        });

        triggerIntersection(false);

        await waitFor(() => {
            expect(result.current).toBe(false);
        });
    });

    it("calls onEnter callback when element enters view", async () => {
        const ref = createRef<HTMLDivElement>();
        const element = document.createElement("div");
        ref.current = element;
        const onEnter = vi.fn();

        renderHook(() => useInView(ref, { onEnter }));

        triggerIntersection(true);

        await waitFor(() => {
            expect(onEnter).toHaveBeenCalled();
        });
    });

    it("calls onLeave callback when element leaves view", async () => {
        const ref = createRef<HTMLDivElement>();
        const element = document.createElement("div");
        ref.current = element;
        const onLeave = vi.fn();

        const { result } = renderHook(() => useInView(ref, { onLeave }));

        triggerIntersection(true);

        await waitFor(() => {
            expect(result.current).toBe(true);
        });

        triggerIntersection(false);

        await waitFor(() => {
            expect(onLeave).toHaveBeenCalled();
        });
    });

    it("does not call onEnter again if already in view", async () => {
        const ref = createRef<HTMLDivElement>();
        const element = document.createElement("div");
        ref.current = element;
        const onEnter = vi.fn();

        const { result } = renderHook(() => useInView(ref, { onEnter }));

        triggerIntersection(true);

        await waitFor(() => {
            expect(result.current).toBe(true);
        });

        expect(onEnter).toHaveBeenCalledTimes(1);

        triggerIntersection(true);

        expect(onEnter).toHaveBeenCalledTimes(1);
    });

    it("disconnects observer on unmount", () => {
        const ref = createRef<HTMLDivElement>();
        const element = document.createElement("div");
        ref.current = element;

        const { unmount } = renderHook(() => useInView(ref));

        unmount();

        expect(mockIntersectionObserver.disconnect).toHaveBeenCalled();
    });

    it("disconnects observer when triggerOnce is true and element enters view", async () => {
        const ref = createRef<HTMLDivElement>();
        const element = document.createElement("div");
        ref.current = element;

        renderHook(() => useInView(ref, { triggerOnce: true }));

        triggerIntersection(true);

        await waitFor(() => {
            expect(mockIntersectionObserver.disconnect).toHaveBeenCalled();
        });
    });

    it("does not call onLeave when triggerOnce is true", async () => {
        const ref = createRef<HTMLDivElement>();
        const element = document.createElement("div");
        ref.current = element;
        const onLeave = vi.fn();

        const { result } = renderHook(() =>
            useInView(ref, { triggerOnce: true, onLeave }),
        );

        triggerIntersection(true);

        await waitFor(() => {
            expect(result.current).toBe(true);
        });

        triggerIntersection(false);

        await waitFor(() => {
            expect(onLeave).not.toHaveBeenCalled();
        });

        expect(result.current).toBe(true);
    });

    it("passes threshold option to IntersectionObserver", () => {
        const ref = createRef<HTMLDivElement>();
        const element = document.createElement("div");
        ref.current = element;

        renderHook(() => useInView(ref, { threshold: 0.5 }));

        expect(MockIntersectionObserver).toHaveBeenCalledWith(
            expect.any(Function),
            expect.objectContaining({ threshold: 0.5 }),
        );
    });

    it("passes rootMargin option to IntersectionObserver", () => {
        const ref = createRef<HTMLDivElement>();
        const element = document.createElement("div");
        ref.current = element;

        renderHook(() => useInView(ref, { rootMargin: "10px" }));

        expect(MockIntersectionObserver).toHaveBeenCalledWith(
            expect.any(Function),
            expect.objectContaining({ rootMargin: "10px" }),
        );
    });

    it("updates observer when ref changes", () => {
        const ref1 = createRef<HTMLDivElement>();
        const element1 = document.createElement("div");
        ref1.current = element1;

        const ref2 = createRef<HTMLDivElement>();
        const element2 = document.createElement("div");
        ref2.current = element2;

        const { rerender } = renderHook(({ ref }) => useInView(ref), {
            initialProps: { ref: ref1 },
        });

        expect(mockIntersectionObserver.observe).toHaveBeenCalledWith(element1);

        rerender({ ref: ref2 });

        expect(mockIntersectionObserver.disconnect).toHaveBeenCalled();
        expect(mockIntersectionObserver.observe).toHaveBeenCalledWith(element2);
    });
});

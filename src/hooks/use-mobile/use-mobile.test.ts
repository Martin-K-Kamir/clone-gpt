import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useIsMobile } from "./use-mobile";

const MOBILE_BREAKPOINT = 1162;

describe("useIsMobile", () => {
    let changeListener: ((event: MediaQueryListEvent) => void) | null = null;

    const createMockMatchMedia = (isMobileWidth: boolean) => {
        return vi.fn((query: string) => {
            const isMobileQuery = query.includes(
                `max-width: ${MOBILE_BREAKPOINT - 1}px`,
            );

            Object.defineProperty(window, "innerWidth", {
                writable: true,
                configurable: true,
                value: isMobileWidth
                    ? MOBILE_BREAKPOINT - 1
                    : MOBILE_BREAKPOINT,
            });

            const matches = isMobileQuery && isMobileWidth;

            return {
                matches,
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn((event: string, listener: any) => {
                    if (event === "change") {
                        changeListener = listener;
                    }
                }),
                removeEventListener: vi.fn((event: string) => {
                    if (event === "change") {
                        changeListener = null;
                    }
                }),
                dispatchEvent: vi.fn(),
            } as MediaQueryList;
        });
    };

    beforeEach(() => {
        vi.clearAllMocks();
        changeListener = null;
    });

    afterEach(() => {
        changeListener = null;
    });

    it("should return false when width is at or above breakpoint", () => {
        Object.defineProperty(window, "matchMedia", {
            writable: true,
            configurable: true,
            value: createMockMatchMedia(false),
        });

        const { result } = renderHook(() => useIsMobile());

        expect(result.current).toBe(false);
    });

    it("should return true when width is below breakpoint", () => {
        Object.defineProperty(window, "matchMedia", {
            writable: true,
            configurable: true,
            value: createMockMatchMedia(true),
        });

        const { result } = renderHook(() => useIsMobile());

        expect(result.current).toBe(true);
    });

    it("should update when media query changes", async () => {
        let capturedListener: ((event: MediaQueryListEvent) => void) | null =
            null;

        Object.defineProperty(window, "matchMedia", {
            writable: true,
            configurable: true,
            value: vi.fn((query: string) => {
                Object.defineProperty(window, "innerWidth", {
                    writable: true,
                    configurable: true,
                    value: MOBILE_BREAKPOINT,
                });

                return {
                    matches: false,
                    media: query,
                    onchange: null,
                    addListener: vi.fn(),
                    removeListener: vi.fn(),
                    addEventListener: vi.fn((event: string, listener: any) => {
                        if (event === "change") {
                            capturedListener = listener;
                        }
                    }),
                    removeEventListener: vi.fn(),
                    dispatchEvent: vi.fn(),
                } as MediaQueryList;
            }),
        });

        const { result } = renderHook(() => useIsMobile());

        expect(result.current).toBe(false);

        Object.defineProperty(window, "innerWidth", {
            writable: true,
            configurable: true,
            value: MOBILE_BREAKPOINT - 1,
        });

        if (capturedListener) {
            (capturedListener as (event: MediaQueryListEvent) => void)({
                matches: true,
            } as MediaQueryListEvent);
            await waitFor(() => {
                expect(result.current).toBe(true);
            });
        }
    });

    it("should remove event listener on unmount", () => {
        const removeEventListener = vi.fn();
        Object.defineProperty(window, "matchMedia", {
            writable: true,
            configurable: true,
            value: vi.fn(() => ({
                matches: false,
                addEventListener: vi.fn((event: string, listener: any) => {
                    if (event === "change") {
                        changeListener = listener;
                    }
                }),
                removeEventListener,
            })) as unknown as typeof window.matchMedia,
        });

        const { unmount } = renderHook(() => useIsMobile());

        unmount();

        expect(removeEventListener).toHaveBeenCalled();
    });
});

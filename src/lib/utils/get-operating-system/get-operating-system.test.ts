/**
 * @vitest-environment jsdom
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getOperatingSystem } from "./get-operating-system";

describe("getOperatingSystem", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return null when no userAgent is provided and window is undefined", () => {
        const originalWindow = global.window;
        delete (global as any).window;

        expect(getOperatingSystem()).toBeNull();

        global.window = originalWindow;
    });

    it("should return null when userAgent is empty string", () => {
        expect(getOperatingSystem("")).toBeNull();
    });

    it("should detect macOS from userAgent", () => {
        expect(
            getOperatingSystem(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
            ),
        ).toBe("macOS");
        expect(
            getOperatingSystem(
                "Mozilla/5.0 (MacIntel; Intel Mac OS X 10_15_7)",
            ),
        ).toBe("macOS");
        expect(
            getOperatingSystem("Mozilla/5.0 (MacPPC; Intel Mac OS X 10_15_7)"),
        ).toBe("macOS");
        expect(
            getOperatingSystem("Mozilla/5.0 (Mac68K; Intel Mac OS X 10_15_7)"),
        ).toBe("macOS");
    });

    it("should detect iOS from userAgent", () => {
        expect(
            getOperatingSystem(
                "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15",
            ),
        ).toBe("iOS");
        expect(
            getOperatingSystem(
                "Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15",
            ),
        ).toBe("iOS");
        expect(
            getOperatingSystem(
                "Mozilla/5.0 (iPod; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15",
            ),
        ).toBe("iOS");
    });

    it("should detect Windows from userAgent", () => {
        expect(
            getOperatingSystem(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            ),
        ).toBe("windows");
        expect(
            getOperatingSystem(
                "Mozilla/5.0 (Windows NT 10.0; Win32; x86) AppleWebKit/537.36",
            ),
        ).toBe("windows");
        expect(
            getOperatingSystem("Mozilla/5.0 (Windows NT 10.0; Windows; x64)"),
        ).toBe("windows");
        expect(getOperatingSystem("Mozilla/5.0 (Windows CE; x86)")).toBe(
            "windows",
        );
    });

    it("should detect Android from userAgent", () => {
        expect(
            getOperatingSystem(
                "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36",
            ),
        ).toBe("android");
    });

    it("should detect Linux from userAgent", () => {
        expect(
            getOperatingSystem(
                "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
            ),
        ).toBe("linux");
    });

    it("should return null for unknown userAgent", () => {
        expect(getOperatingSystem("Unknown User Agent")).toBeNull();
    });

    it("should use window.navigator.userAgent when no userAgent provided and window exists", () => {
        const mockUserAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)";
        Object.defineProperty(window.navigator, "userAgent", {
            writable: true,
            value: mockUserAgent,
        });

        expect(getOperatingSystem()).toBe("macOS");
    });

    it("should prioritize provided userAgent over window.navigator.userAgent", () => {
        Object.defineProperty(window.navigator, "userAgent", {
            writable: true,
            value: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        });

        expect(
            getOperatingSystem(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            ),
        ).toBe("windows");
    });

    it("should detect macOS before iOS when both patterns match", () => {
        const userAgent = "Mozilla/5.0 (Macintosh; iPhone; CPU iPhone OS 14_0)";
        expect(getOperatingSystem(userAgent)).toBe("macOS");
    });

    it("should handle case-sensitive matching", () => {
        expect(getOperatingSystem("mozilla/5.0 (android 11)")).toBeNull();
        expect(getOperatingSystem("MOZILLA/5.0 (LINUX X86_64)")).toBeNull();
        expect(getOperatingSystem("Mozilla/5.0 (Android 11)")).toBe("android");
        expect(getOperatingSystem("Mozilla/5.0 (Linux x86_64)")).toBe("linux");
    });
});

import { afterEach, describe, expect, it } from "vitest";

import { absoluteUrl, getBaseUrl } from "./absolute-url";

describe("getBaseUrl", () => {
    const originalNextPublic = process.env.NEXT_PUBLIC_APP_URL;
    const originalApp = process.env.APP_URL;
    const originalVercel = process.env.VERCEL_URL;

    afterEach(() => {
        if (global.window) {
            delete (global as any).window;
        }
        if (originalNextPublic !== undefined) {
            process.env.NEXT_PUBLIC_APP_URL = originalNextPublic;
        } else {
            delete process.env.NEXT_PUBLIC_APP_URL;
        }
        if (originalApp !== undefined) {
            process.env.APP_URL = originalApp;
        } else {
            delete process.env.APP_URL;
        }
        if (originalVercel !== undefined) {
            process.env.VERCEL_URL = originalVercel;
        } else {
            delete process.env.VERCEL_URL;
        }
    });

    it("should return window.location.origin in browser environment", () => {
        const mockWindow = {
            location: {
                origin: "https://example.com",
            },
        };
        Object.defineProperty(global, "window", {
            value: mockWindow,
            writable: true,
            configurable: true,
        });

        expect(getBaseUrl()).toBe("https://example.com");
    });

    it("should return NEXT_PUBLIC_APP_URL if set", () => {
        delete (global as any).window;
        process.env.NEXT_PUBLIC_APP_URL = "https://custom-app.com";

        expect(getBaseUrl()).toBe("https://custom-app.com");
    });

    it("should return APP_URL if NEXT_PUBLIC_APP_URL is not set", () => {
        delete (global as any).window;
        delete process.env.NEXT_PUBLIC_APP_URL;
        process.env.APP_URL = "https://app-url.com";

        expect(getBaseUrl()).toBe("https://app-url.com");
    });

    it("should return VERCEL_URL with https prefix if other env vars are not set", () => {
        delete (global as any).window;
        delete process.env.NEXT_PUBLIC_APP_URL;
        delete process.env.APP_URL;
        process.env.VERCEL_URL = "my-app.vercel.app";

        expect(getBaseUrl()).toBe("https://my-app.vercel.app");
    });

    it("should return localhost default if no env vars are set", () => {
        delete (global as any).window;
        delete process.env.NEXT_PUBLIC_APP_URL;
        delete process.env.APP_URL;
        delete process.env.VERCEL_URL;

        expect(getBaseUrl()).toBe("http://localhost:3000");
    });
});

describe("absoluteUrl", () => {
    const originalNextPublic = process.env.NEXT_PUBLIC_APP_URL;
    const originalApp = process.env.APP_URL;
    const originalVercel = process.env.VERCEL_URL;

    afterEach(() => {
        if (global.window) {
            delete (global as any).window;
        }
        if (originalNextPublic !== undefined) {
            process.env.NEXT_PUBLIC_APP_URL = originalNextPublic;
        } else {
            delete process.env.NEXT_PUBLIC_APP_URL;
        }
        if (originalApp !== undefined) {
            process.env.APP_URL = originalApp;
        } else {
            delete process.env.APP_URL;
        }
        if (originalVercel !== undefined) {
            process.env.VERCEL_URL = originalVercel;
        } else {
            delete process.env.VERCEL_URL;
        }
    });

    it("should return absolute URL with default path", () => {
        delete (global as any).window;
        process.env.NEXT_PUBLIC_APP_URL = "https://example.com";

        expect(absoluteUrl()).toBe("https://example.com/");
    });

    it("should return absolute URL with custom path", () => {
        delete (global as any).window;
        process.env.NEXT_PUBLIC_APP_URL = "https://example.com";

        expect(absoluteUrl("/api/users")).toBe("https://example.com/api/users");
        expect(absoluteUrl("api/users")).toBe("https://example.com/api/users");
    });

    it("should handle paths with query parameters", () => {
        delete (global as any).window;
        process.env.NEXT_PUBLIC_APP_URL = "https://example.com";

        expect(absoluteUrl("/api/users?id=123")).toBe(
            "https://example.com/api/users?id=123",
        );
    });

    it("should handle paths with hash", () => {
        delete (global as any).window;
        process.env.NEXT_PUBLIC_APP_URL = "https://example.com";

        expect(absoluteUrl("/page#section")).toBe(
            "https://example.com/page#section",
        );
    });

    it("should work with VERCEL_URL environment variable", () => {
        delete (global as any).window;
        delete process.env.NEXT_PUBLIC_APP_URL;
        delete process.env.APP_URL;
        process.env.VERCEL_URL = "my-app.vercel.app";

        expect(absoluteUrl("/api/test")).toBe(
            "https://my-app.vercel.app/api/test",
        );
    });
});

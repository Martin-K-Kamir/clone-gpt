import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";

export const server = setupServer();

beforeAll(() => {
    server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
    server.resetHandlers();
});

afterAll(() => {
    server.close();
});

beforeEach(() => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
        if (typeof input === "string" && input.startsWith("/")) {
            return originalFetch(`http://localhost${input}`, init);
        }
        return originalFetch(input, init);
    });
});

afterEach(() => {
    vi.restoreAllMocks();
});

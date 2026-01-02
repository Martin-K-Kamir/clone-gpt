import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";

export const server = setupServer();

vi.mock("next/cache", async () => {
    const actual = await vi.importActual("next/cache");
    return {
        ...actual,
        revalidateTag: vi.fn(),
        cacheTag: vi.fn(),
        updateTag: vi.fn(),
    };
});

vi.mock("@/lib/utils/handle-api-error", () => ({
    handleApiError: vi.fn((_err, fallback) => fallback()),
}));

beforeAll(() => {
    server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
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

import { afterEach, beforeEach, vi } from "vitest";

import { restoreSeedData } from "./helpers/restore-seed-data";

vi.mock("next/cache", async () => {
    const actual = await vi.importActual("next/cache");
    return {
        ...actual,
        cacheTag: vi.fn(),
        revalidateTag: vi.fn(),
    };
});

beforeEach(async () => {
    await restoreSeedData();
});

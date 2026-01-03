import { describe, expect, it } from "vitest";

import { hashId } from "./hash-id";

describe("hashId", () => {
    it("hashes an ID and returns 16 character hex string", () => {
        const id = "00000000-0000-0000-0000-000000000001";
        const result = hashId(id);

        expect(result).toHaveLength(16);
        expect(result).toMatch(/^[0-9a-f]{16}$/);
    });

    it("produces same hash for same input", () => {
        const id = "30000000-0000-0000-0000-000000000001";

        const result1 = hashId(id);
        const result2 = hashId(id);

        expect(result1).toBe(result2);
    });

    it("produces different hash for different inputs", () => {
        const id1 = "00000000-0000-0000-0000-000000000001";
        const id2 = "00000000-0000-0000-0000-000000000002";

        const result1 = hashId(id1);
        const result2 = hashId(id2);

        expect(result1).not.toBe(result2);
    });

    it("handles different ID formats", () => {
        const uuid = "550e8400-e29b-41d4-a716-446655440000";
        const simpleId = "user123";
        const longId = "a".repeat(100);

        const uuidHash = hashId(uuid);
        const simpleHash = hashId(simpleId);
        const longHash = hashId(longId);

        expect(uuidHash).toHaveLength(16);
        expect(simpleHash).toHaveLength(16);
        expect(longHash).toHaveLength(16);
        expect(uuidHash).not.toBe(simpleHash);
        expect(uuidHash).not.toBe(longHash);
        expect(simpleHash).not.toBe(longHash);
    });
});

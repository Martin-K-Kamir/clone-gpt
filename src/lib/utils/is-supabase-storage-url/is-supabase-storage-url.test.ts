import { describe, expect, it } from "vitest";

import { isSupabaseStorageUrl } from "./is-supabase-storage-url";

describe("isSupabaseStorageUrl", () => {
    it("should return true for valid Supabase storage URL", () => {
        const url =
            "https://example.supabase.co/storage/v1/object/public/bucket/file.jpg";
        expect(isSupabaseStorageUrl(url)).toBe(true);
    });

    it("should return false for null", () => {
        expect(isSupabaseStorageUrl(null)).toBe(false);
    });

    it("should return false for undefined", () => {
        expect(isSupabaseStorageUrl(undefined)).toBe(false);
    });

    it("should return false for empty string", () => {
        expect(isSupabaseStorageUrl("")).toBe(false);
    });

    it("should return false for regular URL", () => {
        expect(isSupabaseStorageUrl("https://example.com/image.jpg")).toBe(
            false,
        );
    });

    it("should return false for URL without supabase.co", () => {
        expect(
            isSupabaseStorageUrl(
                "https://example.com/storage/v1/object/public/bucket/file.jpg",
            ),
        ).toBe(false);
    });

    it("should return false for URL without storage path", () => {
        expect(
            isSupabaseStorageUrl("https://example.supabase.co/api/v1/data"),
        ).toBe(false);
    });

    it("should return true for URL with different subdomain", () => {
        const url =
            "https://myproject.supabase.co/storage/v1/object/public/bucket/file.jpg";
        expect(isSupabaseStorageUrl(url)).toBe(true);
    });

    it("should return true for URL with query parameters", () => {
        const url =
            "https://example.supabase.co/storage/v1/object/public/bucket/file.jpg?token=abc123";
        expect(isSupabaseStorageUrl(url)).toBe(true);
    });

    it("should return true for URL with hash", () => {
        const url =
            "https://example.supabase.co/storage/v1/object/public/bucket/file.jpg#section";
        expect(isSupabaseStorageUrl(url)).toBe(true);
    });

    it("should return false for URL with similar but incorrect path", () => {
        expect(
            isSupabaseStorageUrl(
                "https://example.supabase.co/storage/v1/object/private/bucket/file.jpg",
            ),
        ).toBe(false);
    });

    it("should return false for URL with port (regex does not account for ports)", () => {
        const url =
            "https://example.supabase.co:443/storage/v1/object/public/bucket/file.jpg";
        expect(isSupabaseStorageUrl(url)).toBe(false);
    });

    it("should handle http protocol", () => {
        const url =
            "http://example.supabase.co/storage/v1/object/public/bucket/file.jpg";
        expect(isSupabaseStorageUrl(url)).toBe(true);
    });
});

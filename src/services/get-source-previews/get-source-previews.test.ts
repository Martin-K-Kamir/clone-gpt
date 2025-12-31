import { server } from "@/vitest.setup";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import type { SourcePreview } from "@/lib/types";

import { getSourcePreviews } from "./get-source-previews";

describe("getSourcePreviews", () => {
    it("should return array of source previews when API returns valid data", async () => {
        const mockPreviews: SourcePreview[] = [
            {
                url: "https://example.com",
                title: "Example",
                description: "An example website",
                siteName: "Example Site",
                image: "https://example.com/image.jpg",
                favicon: "https://example.com/favicon.ico",
            },
            {
                url: "https://test.com",
                title: "Test",
                description: "A test website",
                siteName: "Test Site",
                image: "https://test.com/image.jpg",
                favicon: "https://test.com/favicon.ico",
            },
        ];

        server.use(
            http.post("http://localhost/api/resource-previews", () => {
                return HttpResponse.json(mockPreviews);
            }),
        );

        const result = await getSourcePreviews([
            "https://example.com",
            "https://test.com",
        ]);

        expect(result).toEqual(mockPreviews);
        expect(result).toHaveLength(2);
    });

    it("should filter out null values from response", async () => {
        const mockPreviews: (SourcePreview | null)[] = [
            {
                url: "https://example.com",
                title: "Example",
                description: "An example website",
                siteName: "Example Site",
                image: "https://example.com/image.jpg",
                favicon: "https://example.com/favicon.ico",
            },
            null,
            {
                url: "https://test.com",
                title: "Test",
                description: "A test website",
                siteName: "Test Site",
                image: "https://test.com/image.jpg",
                favicon: "https://test.com/favicon.ico",
            },
        ];

        server.use(
            http.post("http://localhost/api/resource-previews", () => {
                return HttpResponse.json(mockPreviews);
            }),
        );

        const result = await getSourcePreviews([
            "https://example.com",
            "https://test.com",
        ]);

        expect(result).toHaveLength(2);
        expect(result[0]).toEqual(mockPreviews[0]);
        expect(result[1]).toEqual(mockPreviews[2]);
    });

    it("should return empty array when all responses are falsy", async () => {
        server.use(
            http.post("http://localhost/api/resource-previews", () => {
                return HttpResponse.json([null, undefined, false, ""]);
            }),
        );

        const result = await getSourcePreviews([
            "https://example.com",
            "https://test.com",
        ]);

        expect(result).toEqual([]);
    });

    it("should return empty array when API returns empty array", async () => {
        server.use(
            http.post("http://localhost/api/resource-previews", () => {
                return HttpResponse.json([]);
            }),
        );

        const result = await getSourcePreviews([
            "https://example.com",
            "https://test.com",
        ]);

        expect(result).toEqual([]);
    });

    it("should throw error when API request fails", async () => {
        server.use(
            http.post("http://localhost/api/resource-previews", () => {
                return HttpResponse.json(
                    { error: "Invalid request" },
                    { status: 400 },
                );
            }),
        );

        await expect(
            getSourcePreviews(["https://example.com"]),
        ).rejects.toThrow("Failed to fetch previews");
    });

    it("should throw error when API returns server error", async () => {
        server.use(
            http.post("http://localhost/api/resource-previews", () => {
                return HttpResponse.json(
                    { error: "Internal server error" },
                    { status: 500 },
                );
            }),
        );

        await expect(
            getSourcePreviews(["https://example.com"]),
        ).rejects.toThrow("Failed to fetch previews");
    });

    it("should throw error on network failure", async () => {
        server.use(
            http.post("http://localhost/api/resource-previews", () => {
                return HttpResponse.error();
            }),
        );

        await expect(
            getSourcePreviews(["https://example.com"]),
        ).rejects.toThrow();
    });

    it("should handle single URL", async () => {
        const mockPreview: SourcePreview = {
            url: "https://example.com",
            title: "Example",
            description: "An example website",
            siteName: "Example Site",
            image: "https://example.com/image.jpg",
            favicon: "https://example.com/favicon.ico",
        };

        server.use(
            http.post("http://localhost/api/resource-previews", () => {
                return HttpResponse.json([mockPreview]);
            }),
        );

        const result = await getSourcePreviews(["https://example.com"]);

        expect(result).toEqual([mockPreview]);
        expect(result).toHaveLength(1);
    });

    it("should handle multiple URLs", async () => {
        const mockPreviews: SourcePreview[] = Array.from(
            { length: 5 },
            (_, i) => ({
                url: `https://example${i}.com`,
                title: `Example ${i}`,
                description: `Description ${i}`,
                siteName: `Site ${i}`,
                image: `https://example${i}.com/image.jpg`,
                favicon: `https://example${i}.com/favicon.ico`,
            }),
        );

        server.use(
            http.post("http://localhost/api/resource-previews", () => {
                return HttpResponse.json(mockPreviews);
            }),
        );

        const urls = Array.from(
            { length: 5 },
            (_, i) => `https://example${i}.com`,
        );
        const result = await getSourcePreviews(urls);

        expect(result).toHaveLength(5);
        expect(result).toEqual(mockPreviews);
    });
});

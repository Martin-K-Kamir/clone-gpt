import { server } from "@/vitest/unit-setup";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { getCityFromCoords } from "./get-city-from-coords";

describe("getCityFromCoords", () => {
    it("should return city name when city is present in address", async () => {
        const mockData = {
            address: {
                city: "London",
                country: "United Kingdom",
            },
        };

        server.use(
            http.get("https://nominatim.openstreetmap.org/reverse", () => {
                return HttpResponse.json(mockData);
            }),
        );

        const result = await getCityFromCoords({
            lat: 51.5074,
            lng: -0.1278,
        });

        expect(result).toBe("London");
    });

    it("should return town name when city is not present but town is", async () => {
        const mockData = {
            address: {
                town: "Oxford",
                country: "United Kingdom",
            },
        };

        server.use(
            http.get("https://nominatim.openstreetmap.org/reverse", () => {
                return HttpResponse.json(mockData);
            }),
        );

        const result = await getCityFromCoords({
            lat: 51.752,
            lng: -1.2577,
        });

        expect(result).toBe("Oxford");
    });

    it("should return village name when city and town are not present but village is", async () => {
        const mockData = {
            address: {
                village: "Smalltown",
                country: "United Kingdom",
            },
        };

        server.use(
            http.get("https://nominatim.openstreetmap.org/reverse", () => {
                return HttpResponse.json(mockData);
            }),
        );

        const result = await getCityFromCoords({
            lat: 50.0,
            lng: -1.0,
        });

        expect(result).toBe("Smalltown");
    });

    it("should return null when city, town, and village are not present", async () => {
        const mockData = {
            address: {
                country: "United Kingdom",
            },
        };

        server.use(
            http.get("https://nominatim.openstreetmap.org/reverse", () => {
                return HttpResponse.json(mockData);
            }),
        );

        const result = await getCityFromCoords({
            lat: 50.0,
            lng: -1.0,
        });

        expect(result).toBeNull();
    });

    it("should throw error when API request fails", async () => {
        server.use(
            http.get("https://nominatim.openstreetmap.org/reverse", () => {
                return HttpResponse.json(
                    { error: "Unable to geocode" },
                    { status: 500 },
                );
            }),
        );

        await expect(
            getCityFromCoords({
                lat: 51.5074,
                lng: -0.1278,
            }),
        ).rejects.toThrow("Failed to reverse geocode position");
    });

    it("should throw error on network failure", async () => {
        server.use(
            http.get("https://nominatim.openstreetmap.org/reverse", () => {
                return HttpResponse.error();
            }),
        );

        await expect(
            getCityFromCoords({
                lat: 51.5074,
                lng: -0.1278,
            }),
        ).rejects.toThrow();
    });

    it("should prioritize city over town and village", async () => {
        const mockData = {
            address: {
                city: "London",
                town: "Westminster",
                village: "Mayfair",
            },
        };

        server.use(
            http.get("https://nominatim.openstreetmap.org/reverse", () => {
                return HttpResponse.json(mockData);
            }),
        );

        const result = await getCityFromCoords({
            lat: 51.5074,
            lng: -0.1278,
        });

        expect(result).toBe("London");
    });

    it("should handle negative coordinates", async () => {
        const mockData = {
            address: {
                city: "New York",
            },
        };

        server.use(
            http.get("https://nominatim.openstreetmap.org/reverse", () => {
                return HttpResponse.json(mockData);
            }),
        );

        const result = await getCityFromCoords({
            lat: 40.7128,
            lng: -74.006,
        });

        expect(result).toBe("New York");
    });

    it("should handle decimal coordinates", async () => {
        const mockData = {
            address: {
                city: "Tokyo",
            },
        };

        server.use(
            http.get("https://nominatim.openstreetmap.org/reverse", () => {
                return HttpResponse.json(mockData);
            }),
        );

        const result = await getCityFromCoords({
            lat: 35.6762,
            lng: 139.6503,
        });

        expect(result).toBe("Tokyo");
    });
});

import { server } from "@/vitest/unit-setup";
import { HttpResponse, http } from "msw";
import { describe, expect, it, vi } from "vitest";

import * as utils from "@/lib/utils";

import { getCurrentCity } from "./get-current-city";

describe("getCurrentCity", () => {
    it("should return city name when IP lookup provides city", async () => {
        server.use(
            http.get("https://ipapi.co/json/", () => {
                return HttpResponse.json({
                    city: "London",
                    country: "GB",
                });
            }),
        );

        const result = await getCurrentCity();

        expect(result).toBe("London");
    });

    it("should return city from geolocation when IP lookup returns no city", async () => {
        server.use(
            http.get("https://ipapi.co/json/", () => {
                return HttpResponse.json({
                    country: "GB",
                });
            }),
            http.get("https://nominatim.openstreetmap.org/reverse", () => {
                return HttpResponse.json({
                    address: {
                        city: "Oxford",
                    },
                });
            }),
        );

        vi.spyOn(utils, "getGeolocation").mockResolvedValue({
            latitude: 51.752,
            longitude: -1.2577,
        });

        const result = await getCurrentCity();

        expect(result).toBe("Oxford");
    });

    it("should throw error when IP lookup fails", async () => {
        server.use(
            http.get("https://ipapi.co/json/", () => {
                return HttpResponse.json(
                    { error: "Rate limit exceeded" },
                    { status: 429 },
                );
            }),
        );

        await expect(getCurrentCity()).rejects.toThrow(
            "Failed to get city from IP",
        );
    });

    it("should return null when IP lookup succeeds but returns no city, and geolocation also returns no city", async () => {
        server.use(
            http.get("https://ipapi.co/json/", () => {
                return HttpResponse.json({
                    country: "GB",
                });
            }),
            http.get("https://nominatim.openstreetmap.org/reverse", () => {
                return HttpResponse.json({
                    address: {
                        country: "United Kingdom",
                    },
                });
            }),
        );

        vi.spyOn(utils, "getGeolocation").mockResolvedValue({
            latitude: 51.5074,
            longitude: -0.1278,
        });

        const result = await getCurrentCity();

        expect(result).toBeNull();
    });

    it("should throw error when geolocation fails during fallback", async () => {
        server.use(
            http.get("https://ipapi.co/json/", () => {
                return HttpResponse.json({
                    country: "GB",
                });
            }),
        );

        vi.spyOn(utils, "getGeolocation").mockRejectedValue(
            new Error("Geolocation is not supported"),
        );

        await expect(getCurrentCity()).rejects.toThrow(
            "Geolocation is not supported",
        );
    });

    it("should throw error when geolocation reverse lookup fails during fallback", async () => {
        server.use(
            http.get("https://ipapi.co/json/", () => {
                return HttpResponse.json({
                    country: "GB",
                });
            }),
            http.get("https://nominatim.openstreetmap.org/reverse", () => {
                return HttpResponse.json(
                    { error: "Unable to geocode" },
                    { status: 500 },
                );
            }),
        );

        vi.spyOn(utils, "getGeolocation").mockResolvedValue({
            latitude: 51.5074,
            longitude: -0.1278,
        });

        await expect(getCurrentCity()).rejects.toThrow(
            "Failed to reverse geocode position",
        );
    });
});

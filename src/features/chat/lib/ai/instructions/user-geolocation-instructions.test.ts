import type { Geo } from "@vercel/functions";
import { describe, expect, expectTypeOf, it } from "vitest";

import { userGeolocationInstructions } from "./user-geolocation-instructions";

describe("userGeolocationInstructions", () => {
    it("should return a string", () => {
        const geo: Geo = {};

        const result = userGeolocationInstructions(geo);

        expectTypeOf(result).toEqualTypeOf<string>();
        expect(typeof result).toBe("string");
    });

    it("should return empty string when all fields are missing", () => {
        const geo: Geo = {};

        const result = userGeolocationInstructions(geo);

        expectTypeOf(result).toEqualTypeOf<string>();
        expect(result).toBe("");
    });

    it("should return a string when city is provided", () => {
        const geo: Geo = {
            city: "Prague",
        };

        const result = userGeolocationInstructions(geo);

        expectTypeOf(result).toEqualTypeOf<string>();
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
    });

    it("should return a string when country is provided", () => {
        const geo: Geo = {
            country: "Czech Republic",
        };

        const result = userGeolocationInstructions(geo);

        expectTypeOf(result).toEqualTypeOf<string>();
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
    });

    it("should return a string when coordinates are provided", () => {
        const geo: Geo = {
            latitude: "50.0755",
            longitude: "14.4378",
        };

        const result = userGeolocationInstructions(geo);

        expectTypeOf(result).toEqualTypeOf<string>();
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
    });

    it("should return a string when all fields are provided", () => {
        const geo: Geo = {
            city: "Prague",
            country: "Czech Republic",
            countryRegion: "Prague",
            latitude: "50.0755",
            longitude: "14.4378",
            region: "Central Europe",
        };

        const result = userGeolocationInstructions(geo);

        expectTypeOf(result).toEqualTypeOf<string>();
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
    });

    it("should return a string for partial geo data", () => {
        const geo: Geo = {
            city: "Prague",
            country: "Czech Republic",
        };

        const result = userGeolocationInstructions(geo);

        expectTypeOf(result).toEqualTypeOf<string>();
        expect(typeof result).toBe("string");
        expect(result.length).toBeGreaterThan(0);
    });
});

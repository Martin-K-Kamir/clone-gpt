import { server } from "@/vitest.setup";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { getCityFromIP } from "./get-city-from-ip";

describe("getCityFromIP", () => {
    it("should return city name when city is present in response", async () => {
        const mockData = {
            city: "London",
            country: "GB",
            country_name: "United Kingdom",
            ip: "1.2.3.4",
        };

        server.use(
            http.get("https://ipapi.co/json/", () => {
                return HttpResponse.json(mockData);
            }),
        );

        const result = await getCityFromIP();

        expect(result).toBe("London");
    });

    it("should return null when city is not present in response", async () => {
        const mockData = {
            country: "GB",
            country_name: "United Kingdom",
            ip: "1.2.3.4",
        };

        server.use(
            http.get("https://ipapi.co/json/", () => {
                return HttpResponse.json(mockData);
            }),
        );

        const result = await getCityFromIP();

        expect(result).toBeNull();
    });

    it("should return null when city is empty string", async () => {
        const mockData = {
            city: "",
            country: "GB",
            ip: "1.2.3.4",
        };

        server.use(
            http.get("https://ipapi.co/json/", () => {
                return HttpResponse.json(mockData);
            }),
        );

        const result = await getCityFromIP();

        expect(result).toBeNull();
    });

    it("should throw error when API request fails", async () => {
        server.use(
            http.get("https://ipapi.co/json/", () => {
                return HttpResponse.json(
                    { error: "Rate limit exceeded" },
                    { status: 429 },
                );
            }),
        );

        await expect(getCityFromIP()).rejects.toThrow(
            "Failed to get city from IP",
        );
    });

    it("should throw error on network failure", async () => {
        server.use(
            http.get("https://ipapi.co/json/", () => {
                return HttpResponse.error();
            }),
        );

        await expect(getCityFromIP()).rejects.toThrow();
    });

    it("should handle various city name formats", async () => {
        const testCases = [
            { city: "New York", expected: "New York" },
            { city: "São Paulo", expected: "São Paulo" },
            { city: "Hong Kong", expected: "Hong Kong" },
        ];

        for (const testCase of testCases) {
            server.use(
                http.get("https://ipapi.co/json/", () => {
                    return HttpResponse.json({
                        city: testCase.city,
                        country: "US",
                    });
                }),
            );

            const result = await getCityFromIP();
            expect(result).toBe(testCase.expected);
        }
    });

    it("should handle full ipapi.co response structure", async () => {
        const mockData = {
            ip: "8.8.8.8",
            city: "Mountain View",
            region: "California",
            region_code: "CA",
            country: "US",
            country_name: "United States",
            country_code_iso3: "USA",
            country_capital: "Washington",
            country_tld: ".us",
            continent_code: "NA",
            in_eu: false,
            postal: "94043",
            latitude: 37.386,
            longitude: -122.0838,
            timezone: "America/Los_Angeles",
            utc_offset: "-0700",
            country_calling_code: "+1",
            currency: "USD",
            currency_name: "Dollar",
            languages: "en-US,es-US,haw,fr",
            country_area: 9629091.0,
            country_population: 327167434,
            asn: "AS15169",
            org: "Google LLC",
        };

        server.use(
            http.get("https://ipapi.co/json/", () => {
                return HttpResponse.json(mockData);
            }),
        );

        const result = await getCityFromIP();

        expect(result).toBe("Mountain View");
    });
});

import { server } from "@/vitest/unit-setup";
import { HttpResponse, http } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { MEASUREMENT_SYSTEM } from "@/lib/constants";

import { getWeatherByCity } from "./weather";

const createMockWeatherResponse = (count = 12) => ({
    city: {
        id: 2643743,
        name: "London",
        country: "GB",
        timezone: 0,
        sunrise: 1696042800,
        sunset: 1696086000,
    },
    list: Array.from({ length: count }, (_, i) => ({
        dt: 1696042800 + i * 3600,
        dt_txt: new Date((1696042800 + i * 3600) * 1000).toISOString(),
        visibility: 10000,
        pop: 0.1,
        main: {
            temp: 15 + i,
            feels_like: 14 + i,
            temp_min: 13 + i,
            temp_max: 17 + i,
            pressure: 1013,
            sea_level: 1013,
            grnd_level: 1010,
            humidity: 65,
            temp_kf: 0.5,
        },
        weather: [
            {
                id: 800,
                main: "Clear",
                description: "clear sky",
                icon: "01d" as const,
            },
        ],
        clouds: {
            all: 0,
        },
        wind: {
            speed: 3.5,
            deg: 180,
            gust: 5.0,
        },
        rain: i % 3 === 0 ? { "3h": 0.5 } : undefined,
        snow: undefined,
        sys: {
            pod: (i % 2 === 0 ? "d" : "n") as "d" | "n",
        },
    })),
});

describe("getWeatherByCity", () => {
    const mockApiKey = "test-api-key";

    beforeEach(() => {
        vi.stubEnv("OPENWEATHER_API_KEY", mockApiKey);
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("should fetch weather data successfully with default options", async () => {
        const mockData = createMockWeatherResponse(12);

        server.use(
            http.get("https://api.openweathermap.org/data/2.5/forecast", () => {
                return HttpResponse.json(mockData);
            }),
        );

        const result = await getWeatherByCity({ city: "London" });

        expect(result).toBeDefined();
        expect(result.location).toEqual({
            ...mockData.city,
            city: mockData.city.name,
        });
        expect(result.list).toHaveLength(12);
        expect(result.list[0]).toMatchObject({
            timestamp: mockData.list[0].dt,
            date: mockData.list[0].dt_txt,
            visibility: mockData.list[0].visibility,
            pop: mockData.list[0].pop,
            temp: mockData.list[0].main.temp,
            tempMin: mockData.list[0].main.temp_min,
            tempMax: mockData.list[0].main.temp_max,
            tempKf: mockData.list[0].main.temp_kf,
            feelsLike: mockData.list[0].main.feels_like,
            pressure: mockData.list[0].main.pressure,
            seaLevel: mockData.list[0].main.sea_level,
            grndLevel: mockData.list[0].main.grnd_level,
            humidity: mockData.list[0].main.humidity,
            id: mockData.list[0].weather[0].id,
            title: mockData.list[0].weather[0].main,
            description: mockData.list[0].weather[0].description,
            iconCode: mockData.list[0].weather[0].icon,
        });
    });

    it("should use correct API parameters with default options", async () => {
        const mockData = createMockWeatherResponse(12);
        let capturedUrl: string | null = null;

        server.use(
            http.get(
                "https://api.openweathermap.org/data/2.5/forecast",
                ({ request }) => {
                    capturedUrl = request.url;
                    return HttpResponse.json(mockData);
                },
            ),
        );

        await getWeatherByCity({ city: "London" });

        expect(capturedUrl).toBeTruthy();
        const url = new URL(capturedUrl!);
        expect(url.searchParams.get("q")).toBe("London");
        expect(url.searchParams.get("appid")).toBe(mockApiKey);
        expect(url.searchParams.get("units")).toBe(MEASUREMENT_SYSTEM.METRIC);
        expect(url.searchParams.get("cnt")).toBe("12");
        expect(url.searchParams.get("lang")).toBe("en");
    });

    it("should use custom forecast limit", async () => {
        const mockData = createMockWeatherResponse(5);
        let capturedUrl: string | null = null;

        server.use(
            http.get(
                "https://api.openweathermap.org/data/2.5/forecast",
                ({ request }) => {
                    capturedUrl = request.url;
                    return HttpResponse.json(mockData);
                },
            ),
        );

        await getWeatherByCity({
            city: "London",
            options: { forecastLimit: 5 },
        });

        const url = new URL(capturedUrl!);
        expect(url.searchParams.get("cnt")).toBe("5");
    });

    it("should use custom measurement system", async () => {
        const mockData = createMockWeatherResponse(12);
        let capturedUrl: string | null = null;

        server.use(
            http.get(
                "https://api.openweathermap.org/data/2.5/forecast",
                ({ request }) => {
                    capturedUrl = request.url;
                    return HttpResponse.json(mockData);
                },
            ),
        );

        await getWeatherByCity({
            city: "London",
            options: { measurementSystem: MEASUREMENT_SYSTEM.IMPERIAL },
        });

        const url = new URL(capturedUrl!);
        expect(url.searchParams.get("units")).toBe(MEASUREMENT_SYSTEM.IMPERIAL);
    });

    it("should use custom language", async () => {
        const mockData = createMockWeatherResponse(12);
        let capturedUrl: string | null = null;

        server.use(
            http.get(
                "https://api.openweathermap.org/data/2.5/forecast",
                ({ request }) => {
                    capturedUrl = request.url;
                    return HttpResponse.json(mockData);
                },
            ),
        );

        await getWeatherByCity({
            city: "London",
            options: { language: "es" },
        });

        const url = new URL(capturedUrl!);
        expect(url.searchParams.get("lang")).toBe("es");
    });

    it("should handle all options together", async () => {
        const mockData = createMockWeatherResponse(8);
        let capturedUrl: string | null = null;

        server.use(
            http.get(
                "https://api.openweathermap.org/data/2.5/forecast",
                ({ request }) => {
                    capturedUrl = request.url;
                    return HttpResponse.json(mockData);
                },
            ),
        );

        await getWeatherByCity({
            city: "Paris",
            options: {
                forecastLimit: 8,
                measurementSystem: MEASUREMENT_SYSTEM.IMPERIAL,
                language: "fr",
            },
        });

        const url = new URL(capturedUrl!);
        expect(url.searchParams.get("q")).toBe("Paris");
        expect(url.searchParams.get("cnt")).toBe("8");
        expect(url.searchParams.get("units")).toBe(MEASUREMENT_SYSTEM.IMPERIAL);
        expect(url.searchParams.get("lang")).toBe("fr");
    });

    it("should transform weather data correctly", async () => {
        const mockData = createMockWeatherResponse(2);

        server.use(
            http.get("https://api.openweathermap.org/data/2.5/forecast", () => {
                return HttpResponse.json(mockData);
            }),
        );

        const result = await getWeatherByCity({ city: "London" });

        expect(result.list[0]).toMatchObject({
            timestamp: mockData.list[0].dt,
            date: mockData.list[0].dt_txt,
            visibility: mockData.list[0].visibility,
            wind: mockData.list[0].wind,
            clouds: mockData.list[0].clouds,
            pop: mockData.list[0].pop,
            rain: mockData.list[0].rain,
            snow: mockData.list[0].snow,
            timeOfDay: mockData.list[0].sys.pod,
            temp: mockData.list[0].main.temp,
            tempMin: mockData.list[0].main.temp_min,
            tempMax: mockData.list[0].main.temp_max,
            tempKf: mockData.list[0].main.temp_kf,
            feelsLike: mockData.list[0].main.feels_like,
            pressure: mockData.list[0].main.pressure,
            seaLevel: mockData.list[0].main.sea_level,
            grndLevel: mockData.list[0].main.grnd_level,
            humidity: mockData.list[0].main.humidity,
        });

        // Check weather condition mapping
        expect(result.list[0].id).toBe(mockData.list[0].weather[0].id);
        expect(result.list[0].title).toBe(mockData.list[0].weather[0].main);
        expect(result.list[0].description).toBe(
            mockData.list[0].weather[0].description,
        );
        expect(result.list[0].iconCode).toBe(mockData.list[0].weather[0].icon);
    });

    it("should handle optional rain and snow fields", async () => {
        const mockData = createMockWeatherResponse(3);
        // Ensure some items have rain, some don't
        mockData.list[0].rain = { "3h": 1.5 };
        mockData.list[1].rain = undefined;
        (mockData.list[2] as any).snow = { "3h": 2.0 };

        server.use(
            http.get("https://api.openweathermap.org/data/2.5/forecast", () => {
                return HttpResponse.json(mockData);
            }),
        );

        const result = await getWeatherByCity({ city: "London" });

        expect(result.list[0].rain).toEqual({ "3h": 1.5 });
        expect(result.list[1].rain).toBeUndefined();
        expect(result.list[2].snow).toEqual({ "3h": 2.0 });
    });

    it("should throw error when API request fails", async () => {
        server.use(
            http.get("https://api.openweathermap.org/data/2.5/forecast", () => {
                return HttpResponse.json(
                    { error: "City not found" },
                    { status: 404 },
                );
            }),
        );

        await expect(getWeatherByCity({ city: "InvalidCity" })).rejects.toThrow(
            "Failed to fetch weather data",
        );
    });

    it("should throw error on network failure", async () => {
        server.use(
            http.get("https://api.openweathermap.org/data/2.5/forecast", () => {
                return HttpResponse.error();
            }),
        );

        await expect(getWeatherByCity({ city: "London" })).rejects.toThrow();
    });

    it("should handle abort signal", async () => {
        const mockData = createMockWeatherResponse(12);
        const abortController = new AbortController();

        server.use(
            http.get(
                "https://api.openweathermap.org/data/2.5/forecast",
                async () => {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    return HttpResponse.json(mockData);
                },
            ),
        );

        abortController.abort();

        await expect(
            getWeatherByCity({
                city: "London",
                options: { abortSignal: abortController.signal },
            }),
        ).rejects.toThrow();
    });

    it("should validate response data with zod schema", async () => {
        const invalidData = {
            city: {
                name: "London",
            },
            list: [
                {
                    dt: 1696042800,
                },
            ],
        };

        server.use(
            http.get("https://api.openweathermap.org/data/2.5/forecast", () => {
                return HttpResponse.json(invalidData);
            }),
        );

        await expect(getWeatherByCity({ city: "London" })).rejects.toThrow();
    });

    it("should handle empty forecast list", async () => {
        const mockData = {
            city: {
                id: 2643743,
                name: "London",
                country: "GB",
                timezone: 0,
                sunrise: 1696042800,
                sunset: 1696086000,
            },
            list: [],
        };

        server.use(
            http.get("https://api.openweathermap.org/data/2.5/forecast", () => {
                return HttpResponse.json(mockData);
            }),
        );

        const result = await getWeatherByCity({ city: "London" });

        expect(result.list).toHaveLength(0);
        expect(result.location).toBeDefined();
    });

    it("should handle different time of day values", async () => {
        const mockData = createMockWeatherResponse(2);
        mockData.list[0].sys.pod = "d" as const;
        mockData.list[1].sys.pod = "n" as const;

        server.use(
            http.get("https://api.openweathermap.org/data/2.5/forecast", () => {
                return HttpResponse.json(mockData);
            }),
        );

        const result = await getWeatherByCity({ city: "London" });

        expect(result.list[0].timeOfDay).toBe("d");
        expect(result.list[1].timeOfDay).toBe("n");
    });

    it("should URL encode city name correctly", async () => {
        const mockData = createMockWeatherResponse(12);
        let capturedUrl: string | null = null;

        server.use(
            http.get(
                "https://api.openweathermap.org/data/2.5/forecast",
                ({ request }) => {
                    capturedUrl = request.url;
                    return HttpResponse.json(mockData);
                },
            ),
        );

        await getWeatherByCity({ city: "New York" });

        const url = new URL(capturedUrl!);
        expect(url.searchParams.get("q")).toBe("New York");
    });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

import { getGeolocation } from "./get-geolocation";

describe("getGeolocation", () => {
    const mockGetCurrentPosition = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        delete (global.navigator as any).geolocation;
    });

    it("should reject when geolocation is not supported", async () => {
        (global.navigator as any).geolocation = undefined;

        await expect(getGeolocation()).rejects.toThrow(
            "Geolocation is not supported by this browser",
        );
    });

    it("should resolve with coordinates when geolocation succeeds", async () => {
        const mockPosition = {
            coords: {
                latitude: 37.7749,
                longitude: -122.4194,
            },
        };

        mockGetCurrentPosition.mockImplementation(success => {
            success(mockPosition);
        });

        (global.navigator as any).geolocation = {
            getCurrentPosition: mockGetCurrentPosition,
        };

        const result = await getGeolocation();

        expect(result).toEqual({
            latitude: 37.7749,
            longitude: -122.4194,
        });
        expect(mockGetCurrentPosition).toHaveBeenCalledTimes(1);
    });

    it("should use default options when no options provided", async () => {
        const mockPosition = {
            coords: {
                latitude: 40.7128,
                longitude: -74.006,
            },
        };

        mockGetCurrentPosition.mockImplementation(success => {
            success(mockPosition);
        });

        (global.navigator as any).geolocation = {
            getCurrentPosition: mockGetCurrentPosition,
        };

        await getGeolocation();

        expect(mockGetCurrentPosition).toHaveBeenCalledWith(
            expect.any(Function),
            expect.any(Function),
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000,
            },
        );
    });

    it("should merge custom options with default options", async () => {
        const mockPosition = {
            coords: {
                latitude: 51.5074,
                longitude: -0.1278,
            },
        };

        mockGetCurrentPosition.mockImplementation(success => {
            success(mockPosition);
        });

        (global.navigator as any).geolocation = {
            getCurrentPosition: mockGetCurrentPosition,
        };

        await getGeolocation({
            enableHighAccuracy: false,
            timeout: 5000,
        });

        expect(mockGetCurrentPosition).toHaveBeenCalledWith(
            expect.any(Function),
            expect.any(Function),
            {
                enableHighAccuracy: false,
                timeout: 5000,
                maximumAge: 300000,
            },
        );
    });

    it("should reject with error when geolocation fails", async () => {
        const mockError = new Error("User denied geolocation");

        mockGetCurrentPosition.mockImplementation((_, error) => {
            error(mockError);
        });

        (global.navigator as any).geolocation = {
            getCurrentPosition: mockGetCurrentPosition,
        };

        await expect(getGeolocation()).rejects.toThrow(
            "User denied geolocation",
        );
    });

    it("should handle different error types", async () => {
        const mockError = {
            code: 1,
            message: "Permission denied",
        };

        mockGetCurrentPosition.mockImplementation((_, error) => {
            error(mockError);
        });

        (global.navigator as any).geolocation = {
            getCurrentPosition: mockGetCurrentPosition,
        };

        await expect(getGeolocation()).rejects.toEqual(mockError);
    });

    it("should handle zero coordinates", async () => {
        const mockPosition = {
            coords: {
                latitude: 0,
                longitude: 0,
            },
        };

        mockGetCurrentPosition.mockImplementation(success => {
            success(mockPosition);
        });

        (global.navigator as any).geolocation = {
            getCurrentPosition: mockGetCurrentPosition,
        };

        const result = await getGeolocation();

        expect(result).toEqual({
            latitude: 0,
            longitude: 0,
        });
    });

    it("should handle negative coordinates", async () => {
        const mockPosition = {
            coords: {
                latitude: -33.8688,
                longitude: 151.2093,
            },
        };

        mockGetCurrentPosition.mockImplementation(success => {
            success(mockPosition);
        });

        (global.navigator as any).geolocation = {
            getCurrentPosition: mockGetCurrentPosition,
        };

        const result = await getGeolocation();

        expect(result).toEqual({
            latitude: -33.8688,
            longitude: 151.2093,
        });
    });

    it("should handle very precise coordinates", async () => {
        const mockPosition = {
            coords: {
                latitude: 37.7749295,
                longitude: -122.4194155,
            },
        };

        mockGetCurrentPosition.mockImplementation(success => {
            success(mockPosition);
        });

        (global.navigator as any).geolocation = {
            getCurrentPosition: mockGetCurrentPosition,
        };

        const result = await getGeolocation();

        expect(result.latitude).toBeCloseTo(37.7749295, 7);
        expect(result.longitude).toBeCloseTo(-122.4194155, 7);
    });

    it("should override all default options", async () => {
        const mockPosition = {
            coords: {
                latitude: 48.8566,
                longitude: 2.3522,
            },
        };

        mockGetCurrentPosition.mockImplementation(success => {
            success(mockPosition);
        });

        (global.navigator as any).geolocation = {
            getCurrentPosition: mockGetCurrentPosition,
        };

        await getGeolocation({
            enableHighAccuracy: false,
            timeout: 2000,
            maximumAge: 0,
        });

        expect(mockGetCurrentPosition).toHaveBeenCalledWith(
            expect.any(Function),
            expect.any(Function),
            {
                enableHighAccuracy: false,
                timeout: 2000,
                maximumAge: 0,
            },
        );
    });
});

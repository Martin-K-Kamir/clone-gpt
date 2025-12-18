import preview from "#.storybook/preview";
import { expect, waitFor } from "storybook/test";

import {
    TEMPERATURE_SYSTEM,
    TIME_FORMATS,
    TIME_OF_DAY,
    WEATHER_PERIOD,
} from "@/lib/constants";
import type { UIWeatherItem, WeatherPeriod } from "@/lib/types";

import { WeatherLocation } from "./types";
import { Weather } from "./weather";

const FIXED_START_DATE = new Date("2024-01-15T12:00:00Z");

function createMockWeatherItems(
    count: number,
    period: WeatherPeriod,
    startDate: Date = FIXED_START_DATE,
): UIWeatherItem[] {
    const items: UIWeatherItem[] = [];
    const descriptions = [
        "clear sky",
        "few clouds",
        "scattered clouds",
        "broken clouds",
        "shower rain",
        "rain",
        "thunderstorm",
        "snow",
        "mist",
    ];
    const iconCodes = [
        "01d",
        "02d",
        "03d",
        "04d",
        "09d",
        "10d",
        "11d",
        "13d",
        "50d",
    ] as const;

    const getTemperature = (index: number): number => {
        const baseTemp = 23;
        const variation = Math.sin((index / count) * Math.PI * 2) * 5;
        return Math.round((baseTemp + variation) * 10) / 10;
    };

    for (let i = 0; i < count; i++) {
        const date = new Date(startDate);
        if (period === WEATHER_PERIOD.CURRENT) {
            date.setHours(date.getHours() + i);
        } else {
            date.setDate(date.getDate() + i);
            date.setHours(12, 0, 0, 0);
        }

        const temp = getTemperature(i);
        const tempVariation = (i % 5) + 2;
        const tempMax = Math.round((temp + tempVariation) * 10) / 10;
        const tempMin = Math.round((temp - tempVariation) * 10) / 10;

        const description = descriptions[i % descriptions.length];
        const iconCode = iconCodes[i % iconCodes.length];
        const timeOfDay =
            date.getHours() >= 6 && date.getHours() < 18
                ? TIME_OF_DAY.DAY
                : TIME_OF_DAY.NIGHT;

        const finalIconCode = iconCode.replace(
            /[dn]$/,
            timeOfDay,
        ) as UIWeatherItem["iconCode"];

        items.push({
            timestamp: Math.floor(date.getTime() / 1000),
            date,
            temp,
            tempMax,
            tempMin,
            description,
            timeOfDay,
            iconCode: finalIconCode,
        });
    }

    return items;
}

const defaultLocation: WeatherLocation = {
    city: "New York",
    country: "United States",
};

const defaultCurrentForecasts = createMockWeatherItems(
    24,
    WEATHER_PERIOD.CURRENT,
    FIXED_START_DATE,
);
const defaultUpcomingForecasts = createMockWeatherItems(
    14,
    WEATHER_PERIOD.UPCOMING,
    FIXED_START_DATE,
);

const meta = preview.meta({
    component: Weather,
    args: {
        location: defaultLocation,
        forecasts: defaultCurrentForecasts,
        period: WEATHER_PERIOD.CURRENT,
        temperatureSystem: TEMPERATURE_SYSTEM.CELSIUS,
        timeFormat: TIME_FORMATS.HOUR_24,
        className: "bg-zinc-925",
    },
    parameters: {
        a11y: {
            test: "error",
        },
    },
    argTypes: {
        location: {
            control: "object",
            description: "The location object with city and country",
            table: {
                type: {
                    summary: "WeatherLocation",
                },
            },
        },
        forecasts: {
            control: "object",
            description: "Array of weather forecast items",
            table: {
                type: {
                    summary: "UIWeatherItem[]",
                },
            },
        },
        period: {
            control: "select",
            description: "The weather period type (current or upcoming)",
            options: [WEATHER_PERIOD.CURRENT, WEATHER_PERIOD.UPCOMING],
            table: {
                type: {
                    summary: "WeatherPeriod",
                },
                defaultValue: {
                    summary: WEATHER_PERIOD.CURRENT,
                },
            },
        },
        temperatureSystem: {
            control: "select",
            description:
                "The initial temperature system (Celsius or Fahrenheit)",
            options: [
                TEMPERATURE_SYSTEM.CELSIUS,
                TEMPERATURE_SYSTEM.FAHRENHEIT,
            ],
            table: {
                type: {
                    summary: "TemperatureSystem",
                },
                defaultValue: {
                    summary: TEMPERATURE_SYSTEM.CELSIUS,
                },
            },
        },
        timeFormat: {
            control: "select",
            description: "The initial time format (12h or 24h)",
            options: [TIME_FORMATS.HOUR_12, TIME_FORMATS.HOUR_24],
            table: {
                type: {
                    summary: "TimeFormat",
                },
                defaultValue: {
                    summary: TIME_FORMATS.HOUR_24,
                },
            },
        },
        className: {
            control: "text",
            description: "Additional CSS classes",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
    },
});

export const Default = meta.story({
    name: "Current Weather",
    parameters: {
        a11y: {
            disable: true,
        },
    },
});

Default.test(
    "should change temperature system to Fahrenheit",
    async ({ canvas, userEvent }) => {
        localStorage.clear();

        const menuButton = canvas.getByRole("button", { name: /open menu/i });
        expect(menuButton).toBeVisible();
        expect(canvas.getAllByText("°C").length).toBeGreaterThan(0);
        expect(canvas.queryAllByText("°F").length).toBe(0);
        await userEvent.click(menuButton);

        const temperatureSystemMenuItem = await waitFor(() => {
            const items = document.querySelectorAll(
                "[data-slot='dropdown-menu-item']",
            );

            const temperatureSystemMenuItem = Array.from(items).find(item =>
                item.textContent?.includes("°F"),
            );
            if (!temperatureSystemMenuItem) {
                throw new Error("Temperature system menu item not found");
            }
            return temperatureSystemMenuItem;
        });
        await userEvent.click(temperatureSystemMenuItem);

        await waitFor(() => {
            expect(canvas.getAllByText("°F").length).toBeGreaterThan(0);
            expect(canvas.queryAllByText("°C").length).toBe(0);
        });
    },
);

Default.test(
    "should change time format to 12-hour",
    async ({ canvas, userEvent }) => {
        localStorage.clear();

        const menuButton = canvas.getByRole("button", { name: /open menu/i });
        expect(menuButton).toBeVisible();
        expect(canvas.queryByText("1:00 PM")).toBeNull();
        expect(canvas.queryByText("2:00 PM")).toBeNull();
        expect(canvas.queryByText("3:00 PM")).toBeNull();
        expect(canvas.queryByText("13:00")).toBeVisible();
        expect(canvas.queryByText("14:00")).toBeVisible();
        expect(canvas.queryByText("15:00")).toBeVisible();
        await userEvent.click(menuButton);

        const timeFormatMenuItem = await waitFor(() => {
            const items = document.querySelectorAll(
                "[data-slot='dropdown-menu-item']",
            );
            const timeFormatMenuItem = Array.from(items).find(item =>
                item.textContent?.includes("12h"),
            );
            if (!timeFormatMenuItem) {
                throw new Error("Time format menu item not found");
            }
            return timeFormatMenuItem;
        });
        await userEvent.click(timeFormatMenuItem);

        await waitFor(() => {
            expect(canvas.getByText("1:00 PM")).toBeVisible();
            expect(canvas.getByText("2:00 PM")).toBeVisible();
            expect(canvas.getByText("3:00 PM")).toBeVisible();
            expect(canvas.queryByText("13:00")).not.toBeInTheDocument();
            expect(canvas.queryByText("14:00")).not.toBeInTheDocument();
            expect(canvas.queryByText("15:00")).not.toBeInTheDocument();
        });
    },
);

export const UpcomingForecast = meta.story({
    name: "Upcoming Forecast",
    args: {
        period: WEATHER_PERIOD.UPCOMING,
        forecasts: defaultUpcomingForecasts,
    },
});

export const WithCelsius = meta.story({
    name: "Temperature in Celsius",
    args: {
        temperatureSystem: TEMPERATURE_SYSTEM.CELSIUS,
    },
});

WithCelsius.test(
    "should display temperature in Celsius",
    async ({ canvas }) => {
        localStorage.clear();
        expect(canvas.getAllByText("°C").length).toBeGreaterThan(0);
    },
);

export const WithFahrenheit = meta.story({
    name: "Temperature in Fahrenheit",
    args: {
        temperatureSystem: TEMPERATURE_SYSTEM.FAHRENHEIT,
    },
});

WithFahrenheit.test(
    "should display temperature in Fahrenheit",
    async ({ canvas }) => {
        localStorage.clear();
        expect(canvas.getAllByText("°F").length).toBeGreaterThan(0);
    },
);

export const With24HourFormat = meta.story({
    name: "24-Hour Time Format",
    args: {
        timeFormat: TIME_FORMATS.HOUR_24,
        period: WEATHER_PERIOD.CURRENT,
    },
});

With24HourFormat.test(
    "should display time in 24-hour format",
    async ({ canvas }) => {
        localStorage.clear();
        expect(canvas.getByText("13:00")).toBeVisible();
        expect(canvas.getByText("14:00")).toBeVisible();
        expect(canvas.getByText("15:00")).toBeVisible();
    },
);

export const With12HourFormat = meta.story({
    name: "12-Hour Time Format",
    args: {
        timeFormat: TIME_FORMATS.HOUR_12,
        period: WEATHER_PERIOD.CURRENT,
    },
});

With12HourFormat.test(
    "should display time in 12-hour format",
    async ({ canvas }) => {
        localStorage.clear();
        expect(canvas.getByText("1:00 PM")).toBeVisible();
        expect(canvas.getByText("2:00 PM")).toBeVisible();
        expect(canvas.getByText("3:00 PM")).toBeVisible();
    },
);

export const WithManyItems = meta.story({
    name: "With Many Items",
    args: {
        forecasts: createMockWeatherItems(
            30,
            WEATHER_PERIOD.CURRENT,
            FIXED_START_DATE,
        ),
        period: WEATHER_PERIOD.CURRENT,
    },
});

WithManyItems.test(
    "should show 'Show more' button when there are many items",
    async ({ canvas }) => {
        const showMoreButton = canvas.getByRole("button", {
            name: /show more/i,
        });
        expect(showMoreButton).toBeVisible();
    },
);

WithManyItems.test(
    "should expand and collapse items",
    async ({ canvas, userEvent }) => {
        const showMoreButton = canvas.getByRole("button", {
            name: /show more/i,
        });
        expect(showMoreButton).toBeVisible();

        const initialItems = canvas.getAllByRole("listitem");
        expect(initialItems.length).toBe(8);

        await userEvent.click(showMoreButton);

        await waitFor(() => {
            const expandedItems = canvas.getAllByRole("listitem");
            expect(expandedItems.length).toBeGreaterThan(8);
        });

        const showLessButton = canvas.getByRole("button", {
            name: /show less/i,
        });
        await userEvent.click(showLessButton);

        await waitFor(() => {
            const collapsedItems = canvas.getAllByRole("listitem");
            expect(collapsedItems.length).toBe(8);
        });
    },
);

export const WithFewItems = meta.story({
    name: "With Few Items",
    args: {
        forecasts: createMockWeatherItems(
            5,
            WEATHER_PERIOD.CURRENT,
            FIXED_START_DATE,
        ),
    },
});

WithFewItems.test(
    "should not show 'Show more' button when there are few items",
    async ({ canvas }) => {
        const showMoreButton = canvas.queryByRole("button", {
            name: /show more/i,
        });
        expect(showMoreButton).not.toBeInTheDocument();
    },
);

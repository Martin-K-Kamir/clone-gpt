import type { Geo } from "@vercel/functions";

export function userGeolocationInstructions(userGeolocation: Geo) {
    const { city, country, countryRegion, latitude, longitude, region } =
        userGeolocation;

    if (
        !city &&
        !country &&
        !countryRegion &&
        !latitude &&
        !longitude &&
        !region
    )
        return "";

    return `
        **User Location:**
        ${city ? `- City: ${city}` : ""}
        ${country ? `- Country: ${country}` : ""}
        ${countryRegion ? `- Country Region: ${countryRegion}` : ""}
        ${latitude ? `- Latitude: ${latitude}` : ""}
        ${longitude ? `- Longitude: ${longitude}` : ""}
        ${region ? `- Region: ${region}` : ""}
    `;
}

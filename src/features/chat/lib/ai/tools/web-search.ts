import { openai } from "@ai-sdk/openai";
import { Geo } from "@vercel/functions";

export const webSearch = ({ geolocation }: { geolocation: Geo }) => {
    return openai.tools.webSearch({
        searchContextSize: "medium",
        userLocation: {
            type: "approximate",
            city: geolocation.city,
            region: geolocation.country,
        },
    });
};

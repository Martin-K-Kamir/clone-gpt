import "@/app/globals.css";
import addonA11y from "@storybook/addon-a11y";
import addonDocs from "@storybook/addon-docs";
import { definePreview } from "@storybook/nextjs-vite";
import { initialize, mswLoader } from "msw-storybook-addon";
import { INITIAL_VIEWPORTS } from "storybook/viewport";

import theme from "./theme";

// Initialize MSW with configuration
initialize({
    onUnhandledRequest: ({ method, url }) => {
        const pathname = new URL(url).pathname;
        // Only warn about API requests, ignore static assets and HMR
        if (
            pathname.startsWith("/api/") &&
            !pathname.includes(".hot-update") &&
            !pathname.includes("_next")
        ) {
            console.warn(`Unhandled ${method} request to ${url}`);
        }
    },
});

export default definePreview({
    tags: ["autodocs"],
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        docs: {
            theme,
        },
        a11y: {
            test: "error",
        },
        nextjs: {
            appDirectory: true,
        },
        viewport: {
            options: INITIAL_VIEWPORTS,
        },
    },
    loaders: [mswLoader],
    addons: [addonA11y(), addonDocs()],
});

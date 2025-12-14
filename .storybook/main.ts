import { defineMain } from "@storybook/nextjs-vite/node";
import { readFileSync } from "fs";

const showLogs = false;

export default defineMain({
    stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
    addons: [
        "@chromatic-com/storybook",
        "@storybook/addon-vitest",
        "@storybook/addon-a11y",
        "@storybook/addon-docs",
        "msw-storybook-addon",
    ],
    framework: "@storybook/nextjs-vite",
    features: {
        experimentalTestSyntax: true,
    },
    staticDirs: ["../public"],
    viteFinal: async config => {
        // Workaround for @ aliases in tsconfig.json
        // are resolved before Vite aliases. Use a Vite plugin to intercept
        // and replace the module content directly.
        const mockPlugin = {
            name: "storybook-mock-actions",
            enforce: "pre" as const,
            load(id: string) {
                // Intercept after tsconfig resolution - check if it's an action file
                // Pattern: .../actions/sign-in/sign-in.ts -> .../actions/sign-in/sign-in.mock.ts
                if (
                    id.includes("features/auth/services/actions/") &&
                    !id.includes(".mock") &&
                    (id.endsWith("/sign-in.ts") ||
                        id.endsWith("/sign-in-with-credentials.ts") ||
                        id.endsWith("/sign-out.ts") ||
                        id.endsWith("/sign-up.ts"))
                ) {
                    // Replace .ts with .mock.ts
                    const mockPath = id.replace(/\.ts$/, ".mock.ts");

                    try {
                        if (showLogs) {
                            console.log(
                                `[Storybook Mock Plugin] Intercepting: ${id} -> ${mockPath}`,
                            );
                        }
                        const mockContent = readFileSync(mockPath, "utf-8");
                        return mockContent;
                    } catch (error) {
                        if (showLogs) {
                            console.error(
                                `[Storybook Mock Plugin] Failed to load mock file: ${mockPath}`,
                                error,
                            );
                        }
                        return null;
                    }
                }
                return null;
            },
        };

        // Add the plugin at the beginning to ensure it runs first
        if (!config.plugins) {
            config.plugins = [];
        }
        config.plugins = [mockPlugin, ...config.plugins];

        return config;
    },
});

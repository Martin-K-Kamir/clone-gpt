import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { fileURLToPath } from "node:url";
import path from "path";
import { defineConfig } from "vitest/config";

const dirname =
    typeof __dirname !== "undefined"
        ? __dirname
        : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
    test: {
        globals: true,
        include: ["src/**/*.{test,spec}.{js,ts,jsx,tsx}"],
        // Let Storybook addon handle the environment and story discovery
        // Stories are defined in .storybook/main.ts and will be discovered automatically
        watch: false,
        pool: "forks",
        projects: [
            {
                extends: true,
                plugins: [
                    // The plugin will run tests for the stories defined in your Storybook config
                    // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
                    storybookTest({
                        configDir: path.join(dirname, ".storybook"),
                    }),
                ],
                test: {
                    name: "storybook",
                    browser: {
                        enabled: true,
                        headless: true,
                        provider: playwright({}),
                        instances: [
                            {
                                browser: "chromium",
                            },
                        ],
                    },
                    setupFiles: [".storybook/vitest.setup.ts"],
                },
            },
        ],
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
            "#": path.resolve(__dirname, "."),
        },
    },
});

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { fileURLToPath } from "node:url";
import path from "path";
import { defineConfig } from "vitest/config";

const dirname =
    typeof __dirname !== "undefined"
        ? __dirname
        : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    test: {
        globals: true,
        include: ["src/**/*.{test,spec}.{js,ts,jsx,tsx}"],
        watch: false,
        pool: "forks",
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
            exclude: [
                "node_modules/",
                ".storybook/**",
                "**/*.css",
                "src/**/*.test.{ts,tsx}",
                "src/**/*.spec.{ts,tsx}",
                "src/**/*.stories.{ts,tsx}",
                "**/*.d.ts",
                "**/types/**",
                "types/**",
                "**/constants/**",
                "**/index.ts",
                "**/lib/ai/tools/**",
                "**/*.mock.ts",
                "**/*.mocks.ts",
                "**/*.constants.ts",
                "src/vitest/**",
                "src/proxy.ts",
            ],
        },
        projects: [
            {
                test: {
                    name: "unit",
                    include: ["src/**/*.test.{js,ts,jsx,tsx}"],
                    exclude: [
                        "**/*.stories.{js,ts,jsx,tsx}",
                        "**/*.spec.{ts,tsx}",
                        "src/hooks/**/*.test.{js,ts,jsx,tsx}",
                        "src/components/**/*.test.{js,ts,jsx,tsx}",
                        "src/providers/**/*.test.{js,ts,jsx,tsx}",
                        "src/features/**/hooks/**/*.test.{js,ts,jsx,tsx}",
                        "src/features/**/providers/**/*.test.{js,ts,jsx,tsx}",
                    ],
                    environment: "node",
                    setupFiles: ["./src/vitest/unit-setup.ts"],
                },
                resolve: {
                    alias: {
                        "@": path.resolve(__dirname, "./src"),
                        "#": path.resolve(__dirname, "."),
                    },
                },
            },
            {
                test: {
                    name: "integration",
                    include: ["src/**/*.spec.{ts,tsx}"],
                    exclude: ["**/*.test.{ts,tsx}", "**/*.stories.{ts,tsx}"],
                    environment: "node",
                    setupFiles: ["./src/vitest/integration-setup.ts"],
                    testTimeout: 15000,
                    pool: "forks",
                    maxWorkers: 1,
                },
                resolve: {
                    alias: {
                        "@": path.resolve(__dirname, "./src"),
                        "#": path.resolve(__dirname, "."),
                    },
                },
            },
            {
                test: {
                    name: "react",
                    include: [
                        "src/hooks/**/*.test.{js,ts,jsx,tsx}",
                        "src/components/**/*.test.{js,ts,jsx,tsx}",
                        "src/providers/**/*.test.{js,ts,jsx,tsx}",
                        "src/features/**/hooks/**/*.test.{js,ts,jsx,tsx}",
                        "src/features/**/providers/**/*.test.{js,ts,jsx,tsx}",
                    ],
                    exclude: [
                        "**/*.stories.{js,ts,jsx,tsx}",
                        "**/*.spec.{ts,tsx}",
                    ],
                    environment: "jsdom",
                    setupFiles: ["./src/vitest/react-setup.ts"],
                },
                resolve: {
                    alias: {
                        "@": path.resolve(__dirname, "./src"),
                        "#": path.resolve(__dirname, "."),
                    },
                },
            },
            {
                extends: true,
                plugins: [
                    // The plugin will run tests for the stories defined in your Storybook config
                    // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
                    storybookTest({
                        configDir: path.join(dirname, ".storybook"),
                    }),
                ],
                define: {
                    "process.env.NEXT_PUBLIC_SUPABASE_URL": JSON.stringify(
                        process.env.NEXT_PUBLIC_SUPABASE_URL ||
                            "https://mock.supabase.co",
                    ),
                    "process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY":
                        JSON.stringify(
                            process.env.NEXT_PUBLIC_SUPABASE_SECRET_KEY ||
                                "mock-anon-key",
                        ),
                },
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

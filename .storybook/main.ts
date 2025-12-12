import { defineMain } from "@storybook/nextjs-vite/node";

export default defineMain({
    stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
    addons: [
        "@chromatic-com/storybook",
        "@storybook/addon-vitest",
        "@storybook/addon-a11y",
        "@storybook/addon-docs",
        "@storybook/addon-onboarding",
        "msw-storybook-addon",
    ],
    framework: "@storybook/nextjs-vite",
    features: {
        experimentalTestSyntax: true,
    },
    staticDirs: ["../public"],
});

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
        experimentalRSC: true,
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
                const isAuthAction =
                    id.includes("features/auth/services/actions/") &&
                    !id.includes(".mock") &&
                    (id.endsWith("/sign-in.ts") ||
                        id.endsWith("/sign-in-with-credentials.ts") ||
                        id.endsWith("/sign-out.ts") ||
                        id.endsWith("/sign-up.ts"));

                const isAuthService =
                    id.includes("features/auth/services/") &&
                    !id.includes(".mock") &&
                    id.endsWith("/auth.ts");

                const isChatAction =
                    id.includes("features/chat/services/actions/") &&
                    !id.includes(".mock") &&
                    (id.endsWith("/delete-all-user-chats.ts") ||
                        id.endsWith("/delete-user-chat-by-id.ts") ||
                        id.endsWith("/delete-user-file.ts") ||
                        id.endsWith("/delete-user-files.ts") ||
                        id.endsWith("/downvote-chat-message.ts") ||
                        id.endsWith("/set-all-user-chats-visibility.ts") ||
                        id.endsWith("/update-chat-title.ts") ||
                        id.endsWith("/update-chat-visibility.ts") ||
                        id.endsWith("/update-many-chats-visibility.ts") ||
                        id.endsWith("/upload-user-files.ts") ||
                        id.endsWith("/upvote-chat-message.ts"));

                const isChatDb =
                    id.includes("features/chat/services/db/") &&
                    !id.includes(".mock") &&
                    (id.endsWith("/create-user-chat.ts") ||
                        id.endsWith(
                            "/delete-user-chat-messages-starting-from.ts",
                        ) ||
                        id.endsWith("/duplicate-user-chat.ts") ||
                        id.endsWith("/get-chat-access.ts") ||
                        id.endsWith("/get-chat-visibility.ts") ||
                        id.endsWith("/get-user-chat-by-id.ts") ||
                        id.endsWith("/get-user-chat-messages.ts") ||
                        id.endsWith("/get-user-chats.ts") ||
                        id.endsWith("/get-user-chats-by-date.ts") ||
                        id.endsWith("/get-user-shared-chats.ts") ||
                        id.endsWith("/is-user-chat-owner.ts") ||
                        id.endsWith("/search-user-chats.ts") ||
                        id.endsWith("/store-user-chat-message.ts") ||
                        id.endsWith("/store-user-chat-messages.ts") ||
                        id.endsWith("/update-user-chat.ts") ||
                        id.endsWith("/update-user-chat-message.ts"));

                const isStorageFile =
                    id.includes("features/chat/services/storage/") &&
                    !id.includes(".mock") &&
                    (id.endsWith("/hash-id.ts") ||
                        id.endsWith("/upload-to-storage.ts") ||
                        id.endsWith("/delete-storage-directory.ts") ||
                        id.endsWith("/delete-user-file.ts") ||
                        id.endsWith("/duplicate-storage-file.ts") ||
                        id.endsWith("/store-generated-file.ts") ||
                        id.endsWith("/store-generated-image.ts") ||
                        id.endsWith("/store-user-file.ts"));

                const isUserAction =
                    id.includes("features/user/services/actions/") &&
                    !id.includes(".mock") &&
                    (id.endsWith("/delete-user.ts") ||
                        id.endsWith("/update-user-name.ts") ||
                        id.endsWith("/upsert-user-chat-preferences.ts"));

                const isUserDb =
                    id.includes("features/user/services/db/") &&
                    !id.includes(".mock") &&
                    (id.endsWith("/check-user-messages-rate-limit.ts") ||
                        id.endsWith("/check-user-files-rate-limit.ts") ||
                        id.endsWith("/create-user.ts") ||
                        id.endsWith("/create-guest-user.ts") ||
                        id.endsWith("/create-user-files-rate-limit.ts") ||
                        id.endsWith("/create-user-messages-rate-limit.ts") ||
                        id.endsWith("/get-user-by-email.ts") ||
                        id.endsWith("/get-user-by-id.ts") ||
                        id.endsWith("/get-user-chat-preferences.ts") ||
                        id.endsWith("/get-user-files-rate-limit.ts") ||
                        id.endsWith("/get-user-messages-rate-limit.ts") ||
                        id.endsWith("/increment-user-files-rate-limit.ts") ||
                        id.endsWith("/increment-user-messages-rate-limit.ts") ||
                        id.endsWith("/update-user-files-rate-limit.ts") ||
                        id.endsWith("/update-user-messages-rate-limit.ts"));

                const isChatProvider =
                    id.includes("features/chat/providers/") &&
                    !id.includes(".mock") &&
                    (id.endsWith("/chat-cache-sync-provider.tsx") ||
                        id.endsWith("/chat-offset-provider.tsx"));

                if (
                    isAuthAction ||
                    isAuthService ||
                    isChatAction ||
                    isChatDb ||
                    isStorageFile ||
                    isUserAction ||
                    isUserDb ||
                    isChatProvider
                ) {
                    // Special case: delete-user-chat-messages-starting-from has a differently named mock
                    let mockPath = id.replace(/\.ts$/, ".mock.ts");
                    if (
                        id.endsWith(
                            "/delete-user-chat-messages-starting-from.ts",
                        )
                    ) {
                        mockPath = id.replace(
                            "/delete-user-chat-messages-starting-from.ts",
                            "/delete-user-chat-messages-from-message.mock.ts",
                        );
                    }

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

        // Define Node.js globals for browser compatibility
        config.define = {
            ...config.define,
            __dirname: JSON.stringify(""),
            __filename: JSON.stringify(""),
            global: "globalThis",
        };

        return config;
    },
});

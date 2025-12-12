import * as a11yAddonAnnotations from "@storybook/addon-a11y/preview";
import { setProjectAnnotations } from "@storybook/nextjs-vite";

import projectAnnotations from "./preview";

// This is an important step to apply the right configuration when testing your stories.
// More info at: https://storybook.js.org/docs/api/portable-stories/portable-stories-vitest#setprojectannotations
// @ts-expect-error - Storybook type mismatch, but works at runtime
setProjectAnnotations([a11yAddonAnnotations, projectAnnotations]);

// Mock clipboard API for headless browser tests
// In headless browsers, clipboard operations often fail due to permissions
// This mock ensures tests can run reliably
declare global {
    var __mockClipboard__: string | undefined;
}

Object.defineProperty(navigator, "clipboard", {
    value: {
        writeText: async (text: string) => {
            // Store the text in a mock clipboard
            globalThis.__mockClipboard__ = text;
            return Promise.resolve();
        },
        readText: async () => {
            // Read from mock clipboard
            return Promise.resolve(globalThis.__mockClipboard__ || "");
        },
        write: async (data: ClipboardItems) => {
            // For ClipboardItem writes, try to extract text
            for (const item of data) {
                const textBlob = await item.getType("text/plain");
                if (textBlob) {
                    const text = await textBlob.text();
                    globalThis.__mockClipboard__ = text;
                }
            }
            return Promise.resolve();
        },
    },
    writable: true,
    configurable: true,
});

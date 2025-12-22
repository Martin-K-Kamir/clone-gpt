import preview from "#.storybook/preview";
import { expect, waitFor } from "storybook/test";

import { CHAT_MESSAGE_TYPE } from "@/features/chat/lib/constants";
import type { UIFileMessagePart } from "@/features/chat/lib/types";

import { ChatMessageUploadsImages } from "./chat-message-uploads-images";

const meta = preview.meta({
    component: ChatMessageUploadsImages,
    args: {
        parts: [],
        className: "flex flex-col gap-2",
    },
    argTypes: {
        parts: {
            control: false,
            description: "Array of file message parts to filter for images",
        },
        classNameItem: {
            control: "text",
            description:
                "CSS class for each list item. Can be a string or a function that receives isMultiple boolean.",
        },
    },
});

export const Default = meta.story({
    name: "Default (Empty)",
});

Default.test(
    "should render nothing when no image parts",
    async ({ canvas }) => {
        const list = canvas.queryByRole("list");
        expect(list).not.toBeInTheDocument();
    },
);

export const SingleImage = meta.story({
    args: {
        parts: [
            {
                kind: CHAT_MESSAGE_TYPE.IMAGE,
                type: CHAT_MESSAGE_TYPE.FILE,
                name: "photo1.jpg",
                url: "https://picsum.photos/id/239/800/600",
                mediaType: "image/jpeg",
                size: 1024 * 200,
                extension: "jpg",
                width: 800,
                height: 600,
            },
        ] as UIFileMessagePart[],
    },
});

export const MultipleImages = meta.story({
    args: {
        parts: [
            {
                kind: CHAT_MESSAGE_TYPE.IMAGE,
                type: CHAT_MESSAGE_TYPE.FILE,
                name: "photo1.jpg",
                url: "https://picsum.photos/id/239/800/600",
                mediaType: "image/jpeg",
                size: 1024 * 200,
                extension: "jpg",
                width: 800,
                height: 600,
            },
            {
                kind: CHAT_MESSAGE_TYPE.IMAGE,
                type: CHAT_MESSAGE_TYPE.FILE,
                name: "photo2.jpg",
                url: "https://picsum.photos/id/240/800/600",
                mediaType: "image/jpeg",
                size: 1024 * 180,
                extension: "jpg",
                width: 800,
                height: 600,
            },
            {
                kind: CHAT_MESSAGE_TYPE.IMAGE,
                type: CHAT_MESSAGE_TYPE.FILE,
                name: "photo3.jpg",
                url: "https://picsum.photos/id/241/800/600",
                mediaType: "image/jpeg",
                size: 1024 * 220,
                extension: "jpg",
                width: 800,
                height: 600,
            },
        ] as UIFileMessagePart[],
    },
});

MultipleImages.test("should render all images", async ({ canvas }) => {
    await waitFor(() => {
        const images = canvas.getAllByRole("img");
        expect(images.length).toBeGreaterThan(0);
    });
});

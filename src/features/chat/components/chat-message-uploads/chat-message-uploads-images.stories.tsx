import {
    MOCK_IMAGE_PARTS_MULTIPLE,
    MOCK_IMAGE_PARTS_SINGLE,
} from "#.storybook/lib/mocks/messages";
import preview from "#.storybook/preview";
import { expect, waitFor } from "storybook/test";

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

export const Default = meta.story({});

Default.test(
    "should render nothing when no image parts",
    async ({ canvas }) => {
        const list = canvas.queryByRole("list");
        expect(list).not.toBeInTheDocument();
    },
);

export const SingleImage = meta.story({
    args: {
        parts: MOCK_IMAGE_PARTS_SINGLE,
    },
});

export const MultipleImages = meta.story({
    args: {
        parts: MOCK_IMAGE_PARTS_MULTIPLE,
    },
});

MultipleImages.test("should render all images", async ({ canvas }) => {
    await waitFor(() => {
        const images = canvas.getAllByRole("img");
        expect(images.length).toBeGreaterThan(0);
    });
});

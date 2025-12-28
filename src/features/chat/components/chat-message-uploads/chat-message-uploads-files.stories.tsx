import {
    MOCK_FILE_PARTS_MULTIPLE,
    MOCK_FILE_PARTS_SINGLE,
} from "#.storybook/lib/mocks/messages";
import preview from "#.storybook/preview";
import { expect } from "storybook/test";

import { ChatMessageUploadsFiles } from "./chat-message-uploads-files";

const meta = preview.meta({
    component: ChatMessageUploadsFiles,
    args: {
        parts: [],
        className: "flex flex-col gap-2",
    },
    argTypes: {
        parts: {
            control: false,
            description: "Array of file message parts to filter for files",
        },
        classNameItem: {
            control: "text",
            description:
                "CSS class for each list item. Can be a string or a function that receives isMultiple boolean.",
        },
    },
});

export const Default = meta.story({});

Default.test("should render nothing when no file parts", async ({ canvas }) => {
    const list = canvas.queryByRole("list");
    expect(list).not.toBeInTheDocument();
});
export const SingleFile = meta.story({
    args: {
        parts: MOCK_FILE_PARTS_SINGLE,
    },
    parameters: {
        a11y: {
            config: {
                rules: [
                    {
                        id: "color-contrast",
                        enabled: false,
                    },
                ],
            },
        },
    },
});

SingleFile.test("should render single file", async ({ canvas }) => {
    const file = canvas.getByText(/document\.pdf/i);
    expect(file).toBeInTheDocument();
});

SingleFile.test("should render file in list", async ({ canvas }) => {
    const list = canvas.getByRole("list");
    const listItems = list.querySelectorAll("li");
    expect(listItems.length).toBe(1);
});

export const MultipleFiles = meta.story({
    args: {
        parts: MOCK_FILE_PARTS_MULTIPLE,
    },
    parameters: {
        a11y: {
            config: {
                rules: [
                    {
                        id: "color-contrast",
                        enabled: false,
                    },
                ],
            },
        },
    },
});

MultipleFiles.test("should render all files", async ({ canvas }) => {
    const documentFile = canvas.getByText(/document1\.pdf/i);
    const notesFile = canvas.getByText(/document2\.pdf/i);

    expect(documentFile).toBeInTheDocument();
    expect(notesFile).toBeInTheDocument();
});

MultipleFiles.test("should render files in list", async ({ canvas }) => {
    const list = canvas.getByRole("list");
    const listItems = list.querySelectorAll("li");
    expect(listItems.length).toBe(2);
});

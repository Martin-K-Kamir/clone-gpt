import preview from "#.storybook/preview";
import { expect, waitFor } from "storybook/test";

import { CHAT_MESSAGE_TYPE } from "@/features/chat/lib/constants";
import type { UIFileMessagePart } from "@/features/chat/lib/types";

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

export const Default = meta.story({
    name: "Default (Empty)",
});

Default.test("should render nothing when no file parts", async ({ canvas }) => {
    const list = canvas.queryByRole("list");
    expect(list).not.toBeInTheDocument();
});

export const SingleFile = meta.story({
    args: {
        parts: [
            {
                kind: CHAT_MESSAGE_TYPE.FILE,
                type: CHAT_MESSAGE_TYPE.FILE,
                name: "document.pdf",
                url: "https://example.com/document.pdf",
                mediaType: "application/pdf",
                size: 1024 * 500, // 500KB
                extension: "pdf",
            },
        ] as UIFileMessagePart[],
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
    await waitFor(() => {
        const file = canvas.getByText(/document\.pdf/i);
        expect(file).toBeInTheDocument();
    });
});

SingleFile.test("should render file in list", async ({ canvas }) => {
    await waitFor(() => {
        const list = canvas.getByRole("list");
        const listItems = list.querySelectorAll("li");
        expect(listItems.length).toBe(1);
    });
});

export const MultipleFiles = meta.story({
    args: {
        parts: [
            {
                kind: CHAT_MESSAGE_TYPE.FILE,
                type: CHAT_MESSAGE_TYPE.FILE,
                name: "document.pdf",
                url: "https://example.com/document.pdf",
                mediaType: "application/pdf",
                size: 1024 * 500,
                extension: "pdf",
            },
            {
                kind: CHAT_MESSAGE_TYPE.FILE,
                type: CHAT_MESSAGE_TYPE.FILE,
                name: "notes.txt",
                url: "https://example.com/notes.txt",
                mediaType: "text/plain",
                size: 1024 * 10,
                extension: "txt",
            },
            {
                kind: CHAT_MESSAGE_TYPE.FILE,
                type: CHAT_MESSAGE_TYPE.FILE,
                name: "data.xlsx",
                url: "https://example.com/data.xlsx",
                mediaType:
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                size: 1024 * 1000,
                extension: "xlsx",
            },
        ] as UIFileMessagePart[],
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
    await waitFor(() => {
        const documentFile = canvas.getByText(/document\.pdf/i);
        const notesFile = canvas.getByText(/notes\.txt/i);
        const dataFile = canvas.getByText(/data\.xlsx/i);

        expect(documentFile).toBeInTheDocument();
        expect(notesFile).toBeInTheDocument();
        expect(dataFile).toBeInTheDocument();
    });
});

MultipleFiles.test("should render files in list", async ({ canvas }) => {
    await waitFor(() => {
        const list = canvas.getByRole("list");
        const listItems = list.querySelectorAll("li");
        expect(listItems.length).toBe(3);
    });
});

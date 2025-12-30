import { AppProviders } from "#.storybook/lib/decorators/providers";
import {
    MOCK_CHAT_BUTTON_ATTACH_FILE,
    MOCK_CHAT_BUTTON_CLOSE_RATE_LIMIT_INFO,
    MOCK_CHAT_BUTTON_SEND,
    MOCK_CHAT_BUTTON_STOP,
    MOCK_CHAT_FILE_1,
    MOCK_CHAT_FILE_CONTENT_1,
    MOCK_CHAT_FILE_CONTENT_DEFAULT,
    MOCK_CHAT_FILE_DOCUMENT,
    MOCK_CHAT_FILE_IMAGE,
    MOCK_CHAT_MESSAGE_DEFAULT,
    MOCK_CHAT_MESSAGE_LONG,
} from "#.storybook/lib/mocks/chat";
import {
    MOCK_FILES_AND_IMAGES,
    MOCK_FILES_IMAGES,
    MOCK_FILES_MIXED,
    createColoredImageFile,
    createColoredImageFiles,
    createFile,
} from "#.storybook/lib/mocks/files";
import { MOCK_CHAT_STATUS } from "#.storybook/lib/mocks/messages";
import {
    createMockFilesRateLimit,
    createMockMessagesRateLimit,
} from "#.storybook/lib/mocks/rate-limits";
import { getFileInput } from "#.storybook/lib/utils/elements";
import preview from "#.storybook/preview";
import { expect, waitFor } from "storybook/test";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";

import { MemoizedChatComposer } from "./chat-composer";

const meta = preview.meta({
    component: MemoizedChatComposer,
    decorators: [
        (Story, { parameters }) => (
            <AppProviders {...parameters.provider}>
                <div className="bg-zinc-925 grid min-h-svh w-full items-center">
                    <Story />
                </div>
            </AppProviders>
        ),
    ],
});

export const Default = meta.story({});

Default.test("should render message input textarea", async ({ canvas }) => {
    const textarea = canvas.getByRole("textbox");
    expect(textarea).toBeInTheDocument();
});

Default.test("should have disabled send button", async ({ canvas }) => {
    const sendButton = canvas.getByRole("button", {
        name: MOCK_CHAT_BUTTON_SEND,
    });
    expect(sendButton).toBeDisabled();
});

Default.test(
    "should have disabled send button when message is too long",
    async ({ canvas, userEvent }) => {
        const textarea = canvas.getByRole("textbox");
        await userEvent.clear(textarea);
        await userEvent.paste(MOCK_CHAT_MESSAGE_LONG);
        const sendButton = canvas.getByRole("button", {
            name: MOCK_CHAT_BUTTON_SEND,
        });
        expect(sendButton).toBeDisabled();
    },
);

Default.test(
    "should be able to type in textarea",
    async ({ canvas, userEvent }) => {
        const textarea = canvas.getByRole("textbox");
        await userEvent.type(textarea, MOCK_CHAT_MESSAGE_DEFAULT);
        expect(textarea).toHaveValue(MOCK_CHAT_MESSAGE_DEFAULT);
    },
);

Default.test(
    "should disable send button after submitting message",
    async ({ canvas, userEvent }) => {
        const textarea = canvas.getByRole("textbox");
        await userEvent.type(textarea, MOCK_CHAT_MESSAGE_DEFAULT);
        const sendButton = canvas.getByRole("button", {
            name: MOCK_CHAT_BUTTON_SEND,
        });
        await userEvent.click(sendButton);
        expect(sendButton).toBeDisabled();
    },
);

Default.test(
    "should submit message when Enter key is pressed",
    async ({ canvas, userEvent }) => {
        const textarea = canvas.getByRole("textbox");
        await userEvent.type(textarea, MOCK_CHAT_MESSAGE_DEFAULT);
        await userEvent.keyboard("{enter}");
    },
);

Default.test(
    "should reset textarea when message is submitted",
    async ({ canvas, userEvent }) => {
        const textarea = canvas.getByRole("textbox");
        await userEvent.type(textarea, MOCK_CHAT_MESSAGE_DEFAULT);
        await userEvent.keyboard("{enter}");
        expect(textarea).toHaveValue("");
    },
);

Default.test("should attach an image file", async ({ canvas }) => {
    const fileButton = canvas.getByRole("button", {
        name: MOCK_CHAT_BUTTON_ATTACH_FILE,
    });
    expect(fileButton).toBeInTheDocument();

    const fileInput = getFileInput();

    const imageFile = createColoredImageFile("#FF0000", MOCK_CHAT_FILE_IMAGE);

    Object.defineProperty(fileInput, "files", {
        value: [imageFile],
        writable: false,
    });

    const changeEvent = new Event("change", { bubbles: true });
    fileInput.dispatchEvent(changeEvent);

    await waitFor(() => {
        const image = canvas.getByAltText(MOCK_CHAT_FILE_IMAGE);
        expect(image).toBeInTheDocument();
    });
});

Default.test("should attach a file", async ({ canvas }) => {
    const fileButton = canvas.getByRole("button", {
        name: MOCK_CHAT_BUTTON_ATTACH_FILE,
    });
    expect(fileButton).toBeInTheDocument();

    const fileInput = getFileInput();

    const textFile = createFile({
        filename: MOCK_CHAT_FILE_DOCUMENT,
        content: MOCK_CHAT_FILE_CONTENT_DEFAULT,
    });

    Object.defineProperty(fileInput, "files", {
        value: [textFile],
        writable: false,
    });

    const changeEvent = new Event("change", { bubbles: true });
    fileInput.dispatchEvent(changeEvent);

    await waitFor(() => {
        const filesPreview = canvas.getByText(MOCK_CHAT_FILE_DOCUMENT);
        expect(filesPreview).toBeInTheDocument();
    });
});

Default.test("should attach multiple files", async ({ canvas }) => {
    const fileButton = canvas.getByRole("button", {
        name: MOCK_CHAT_BUTTON_ATTACH_FILE,
    });
    expect(fileButton).toBeInTheDocument();

    const fileInput = getFileInput();

    Object.defineProperty(fileInput, "files", {
        value: MOCK_FILES_MIXED,
        writable: false,
    });

    const changeEvent = new Event("change", { bubbles: true });
    fileInput.dispatchEvent(changeEvent);

    await waitFor(() => {
        expect(canvas.getByText("file1.txt")).toBeInTheDocument();
        expect(canvas.getByText("file2.pdf")).toBeInTheDocument();
        expect(canvas.getByText("file3.tsx")).toBeInTheDocument();
    });
});

Default.test("should attach multiple images", async ({ canvas }) => {
    const fileButton = canvas.getByRole("button", {
        name: MOCK_CHAT_BUTTON_ATTACH_FILE,
    });
    expect(fileButton).toBeInTheDocument();

    const fileInput = getFileInput();

    Object.defineProperty(fileInput, "files", {
        value: MOCK_FILES_IMAGES,
        writable: false,
    });

    const changeEvent = new Event("change", { bubbles: true });
    fileInput.dispatchEvent(changeEvent);

    await waitFor(() => {
        const imageElements = canvas.getAllByRole("img");
        expect(imageElements.length).toBeGreaterThanOrEqual(3);
        expect(canvas.getByAltText("FF0000.png")).toBeInTheDocument();
        expect(canvas.getByAltText("0000FF.png")).toBeInTheDocument();
        expect(canvas.getByAltText("00FF00.png")).toBeInTheDocument();
    });
});

Default.test("should attach files and images together", async ({ canvas }) => {
    const fileButton = canvas.getByRole("button", {
        name: MOCK_CHAT_BUTTON_ATTACH_FILE,
    });
    expect(fileButton).toBeInTheDocument();

    const fileInput = getFileInput();

    Object.defineProperty(fileInput, "files", {
        value: MOCK_FILES_AND_IMAGES,
        writable: false,
    });

    const changeEvent = new Event("change", { bubbles: true });
    fileInput.dispatchEvent(changeEvent);

    await waitFor(() => {
        expect(canvas.getByAltText("FF0000.png")).toBeInTheDocument();
        expect(canvas.getByAltText("0000FF.png")).toBeInTheDocument();
        expect(canvas.getByAltText("00FF00.png")).toBeInTheDocument();
        expect(canvas.getByText("file1.txt")).toBeInTheDocument();
        expect(canvas.getByText("file2.pdf")).toBeInTheDocument();
        expect(canvas.getByText("file3.tsx")).toBeInTheDocument();
        expect(canvas.getByText("file4.py")).toBeInTheDocument();
    });
});

Default.test("should remove a file", async ({ canvas, userEvent }) => {
    const fileButton = canvas.getByRole("button", {
        name: MOCK_CHAT_BUTTON_ATTACH_FILE,
    });
    expect(fileButton).toBeInTheDocument();

    const fileInput = getFileInput();

    const textFile = createFile({
        filename: MOCK_CHAT_FILE_DOCUMENT,
        content: MOCK_CHAT_FILE_CONTENT_DEFAULT,
    });

    Object.defineProperty(fileInput, "files", {
        value: [textFile],
        writable: false,
    });

    const changeEvent = new Event("change", { bubbles: true });
    fileInput.dispatchEvent(changeEvent);

    await waitFor(() => {
        expect(canvas.getByText(MOCK_CHAT_FILE_DOCUMENT)).toBeInTheDocument();
    });

    const removeButton = canvas.getByRole("button", {
        name: new RegExp(`remove file ${MOCK_CHAT_FILE_DOCUMENT}`, "i"),
    });
    expect(removeButton).toBeInTheDocument();

    await userEvent.click(removeButton);

    await waitFor(() => {
        const fileText = canvas.queryByText(MOCK_CHAT_FILE_DOCUMENT);
        expect(fileText).not.toBeInTheDocument();
    });
});

Default.test("should remove an image", async ({ canvas, userEvent }) => {
    const fileButton = canvas.getByRole("button", {
        name: MOCK_CHAT_BUTTON_ATTACH_FILE,
    });
    expect(fileButton).toBeInTheDocument();

    const fileInput = getFileInput();

    const imageFile = createColoredImageFile("#FF0000", MOCK_CHAT_FILE_IMAGE);

    Object.defineProperty(fileInput, "files", {
        value: [imageFile],
        writable: false,
    });

    const changeEvent = new Event("change", { bubbles: true });
    fileInput.dispatchEvent(changeEvent);

    await waitFor(() => {
        expect(canvas.getByAltText(MOCK_CHAT_FILE_IMAGE)).toBeInTheDocument();
    });

    const removeButton = canvas.getByRole("button", {
        name: new RegExp(`remove file ${MOCK_CHAT_FILE_IMAGE}`, "i"),
    });
    expect(removeButton).toBeInTheDocument();

    await userEvent.click(removeButton);

    await waitFor(() => {
        const image = canvas.queryByAltText(MOCK_CHAT_FILE_IMAGE);
        expect(image).not.toBeInTheDocument();
    });
});

export const WithFiles = meta.story({
    parameters: {
        provider: {
            selectedFiles: MOCK_FILES_MIXED,
        },
    },
});

WithFiles.test(
    "should show files preview when files are selected",
    async ({ canvas }) => {
        await waitFor(() => {
            expect(canvas.getByText("file1.txt")).toBeInTheDocument();
            expect(canvas.getByText("file2.pdf")).toBeInTheDocument();
            expect(canvas.getByText("file3.tsx")).toBeInTheDocument();
            expect(canvas.getByText("file4.py")).toBeInTheDocument();
        });
    },
);

export const WithImages = meta.story({
    parameters: {
        provider: {
            selectedFiles: MOCK_FILES_IMAGES,
        },
    },
});

WithImages.test(
    "should show images preview when images are selected",
    async ({ canvas }) => {
        await waitFor(() => {
            const images = canvas.getAllByRole("img");
            expect(images.length).toBeGreaterThanOrEqual(3);
        });
    },
);

WithImages.test(
    "should display all three colored images",
    async ({ canvas }) => {
        await waitFor(() => {
            expect(canvas.getByAltText("FF0000.png")).toBeInTheDocument();
            expect(canvas.getByAltText("0000FF.png")).toBeInTheDocument();
            expect(canvas.getByAltText("00FF00.png")).toBeInTheDocument();
        });
    },
);

export const WithFilesAndImages = meta.story({
    parameters: {
        provider: {
            selectedFiles: MOCK_FILES_AND_IMAGES,
        },
    },
});

WithFilesAndImages.test(
    "should show both files and images preview",
    async ({ canvas }) => {
        await waitFor(() => {
            expect(canvas.getByAltText("FF0000.png")).toBeInTheDocument();
            expect(canvas.getByAltText("0000FF.png")).toBeInTheDocument();
            expect(canvas.getByAltText("00FF00.png")).toBeInTheDocument();
            expect(canvas.getByText("file1.txt")).toBeInTheDocument();
            expect(canvas.getByText("file2.pdf")).toBeInTheDocument();
        });
    },
);

export const WithFilesUploading = meta.story({
    parameters: {
        provider: {
            selectedFiles: [
                createFile({
                    filename: MOCK_CHAT_FILE_1,
                    content: MOCK_CHAT_FILE_CONTENT_1,
                }),
            ],
            isUploadingFiles: true,
        },
    },
});

export const WithImagesUploading = meta.story({
    parameters: {
        provider: {
            selectedFiles: createColoredImageFiles(),
            isUploadingFiles: true,
        },
    },
});

export const Streaming = meta.story({
    parameters: {
        provider: {
            status: MOCK_CHAT_STATUS.STREAMING,
        },
    },
});

Streaming.test("should show stop button", async ({ canvas }) => {
    const stopButton = canvas.getByRole("button", {
        name: MOCK_CHAT_BUTTON_STOP,
    });
    expect(stopButton).toBeInTheDocument();
});

Streaming.test("should have disabled file button", async ({ canvas }) => {
    const fileButton = canvas.getByRole("button", {
        name: MOCK_CHAT_BUTTON_ATTACH_FILE,
    });
    expect(fileButton).toBeDisabled();
});

export const Submitted = meta.story({
    parameters: {
        provider: {
            status: MOCK_CHAT_STATUS.SUBMITTED,
        },
    },
});

Submitted.test("should show stop button", async ({ canvas }) => {
    const stopButton = canvas.getByRole("button", {
        name: MOCK_CHAT_BUTTON_STOP,
    });
    expect(stopButton).toBeInTheDocument();
});

Submitted.test("should have disabled file button", async ({ canvas }) => {
    const fileButton = canvas.getByRole("button", {
        name: MOCK_CHAT_BUTTON_ATTACH_FILE,
    });
    expect(fileButton).toBeDisabled();
});

export const RateLimitExceeded = meta.story({
    parameters: {
        provider: {
            rateLimitMessages: createMockMessagesRateLimit({
                tokensCounter: 1000,
                messagesCounter: 50,
                hoursOffset: 0,
            }),
        },
    },
});

RateLimitExceeded.test("should display rate limit info", async ({ canvas }) => {
    const rateLimit = canvas.getByTestId("chat-composer-rate-limit");
    expect(rateLimit).toBeInTheDocument();
});

RateLimitExceeded.test(
    "should have disabled send button",
    async ({ canvas }) => {
        const sendButton = canvas.getByRole("button", {
            name: MOCK_CHAT_BUTTON_SEND,
        });
        expect(sendButton).toBeDisabled();
    },
);

RateLimitExceeded.test(
    "should have disabled file button",
    async ({ canvas }) => {
        const fileButton = canvas.getByRole("button", {
            name: MOCK_CHAT_BUTTON_ATTACH_FILE,
        });
        expect(fileButton).toBeDisabled();
    },
);

RateLimitExceeded.test(
    "should close rate limit info when close button is clicked",
    async ({ canvas, userEvent }) => {
        const closeButton = canvas.getByRole("button", {
            name: MOCK_CHAT_BUTTON_CLOSE_RATE_LIMIT_INFO,
        });
        expect(closeButton).toBeInTheDocument();
        await userEvent.click(closeButton);

        await waitFor(() => {
            const rateLimit = canvas.queryByTestId("chat-composer-rate-limit");
            expect(rateLimit).toBeNull();
        });
    },
);

export const FilesRateLimitExceeded = meta.story({
    parameters: {
        provider: {
            rateLimitFiles: createMockFilesRateLimit({
                filesCounter: 10,
                hoursOffset: 0,
            }),
        },
    },
});

FilesRateLimitExceeded.test(
    "should display rate limit info",
    async ({ canvas }) => {
        const rateLimit = canvas.getByTestId("chat-composer-rate-limit");
        expect(rateLimit).toBeInTheDocument();
    },
);

FilesRateLimitExceeded.test(
    "should have disabled send button",
    async ({ canvas }) => {
        const sendButton = canvas.getByRole("button", {
            name: MOCK_CHAT_BUTTON_SEND,
        });
        expect(sendButton).toBeDisabled();
    },
);

FilesRateLimitExceeded.test(
    "should have disabled file button",
    async ({ canvas }) => {
        const fileButton = canvas.getByRole("button", {
            name: MOCK_CHAT_BUTTON_ATTACH_FILE,
        });
        expect(fileButton).toBeDisabled();
    },
);

FilesRateLimitExceeded.test(
    "should close rate limit info when close button is clicked",
    async ({ canvas, userEvent }) => {
        const closeButton = canvas.getByRole("button", {
            name: MOCK_CHAT_BUTTON_CLOSE_RATE_LIMIT_INFO,
        });
        expect(closeButton).toBeInTheDocument();
        await userEvent.click(closeButton);

        await waitFor(() => {
            const rateLimit = canvas.queryByTestId("chat-composer-rate-limit");
            expect(rateLimit).toBeNull();
        });
    },
);

export const WithFooter = meta.story({
    parameters: {
        provider: {
            isOwner: false,
            visibility: CHAT_VISIBILITY.PUBLIC,
        },
    },
});

WithFooter.test(
    "should show public notice for non-owner in public chat",
    async ({ canvas }) => {
        await waitFor(() => {
            expect(
                canvas.getByTestId("chat-composer-public-notice"),
            ).toBeInTheDocument();
        });
    },
);

export const WithFooterOwner = meta.story({
    parameters: {
        provider: {
            isOwner: true,
            visibility: CHAT_VISIBILITY.PRIVATE,
        },
    },
});

WithFooterOwner.test(
    "should not show public notice for owner",
    async ({ canvas }) => {
        await waitFor(() => {
            const publicNotice = canvas.queryByTestId(
                "chat-composer-public-notice",
            );
            expect(publicNotice).not.toBeInTheDocument();
        });
    },
);

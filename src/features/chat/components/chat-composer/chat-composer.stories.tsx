import preview from "#.storybook/preview";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ChatStatus } from "ai";
import { useMemo, useState } from "react";
import { expect, fn, waitFor } from "storybook/test";

import { SessionSyncProvider } from "@/features/auth/providers";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import type { DBChatId, DBChatVisibility } from "@/features/chat/lib/types";
import {
    ChatCacheSyncProvider,
    ChatFilesContext,
    ChatFilesRateLimitContext,
    ChatHandlersContext,
    ChatMessagesRateLimitContext,
    ChatOffsetProvider,
    ChatProvider,
    ChatSidebarProvider,
    ChatStatusContext,
} from "@/features/chat/providers";

import type {
    DBUserId,
    UserFilesRateLimitResult,
    UserMessagesRateLimitResult,
} from "@/features/user/lib/types";
import {
    UserCacheSyncProvider,
    UserSessionProvider,
} from "@/features/user/providers";

import { MemoizedChatComposer } from "./chat-composer";

const fixedDate = new Date("2025-12-22T12:00:00.000Z");
const mockChatId = "chat-123" as DBChatId;
const mockUserId = "00000000-0000-0000-0000-000000000001" as DBUserId;

function createImageFileFromDataURL(
    dataURL: string,
    filename: string,
    mimeType: string,
): File {
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || mimeType;
    const bstr = atob(arr[1] || "");
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

function createColoredImageFile(
    color: string,
    filename: string,
    width: number = 100,
    height: number = 100,
): File {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, width, height);
    }
    const dataURL = canvas.toDataURL("image/png");
    return createImageFileFromDataURL(dataURL, filename, "image/png");
}

const createImageFiles = () => {
    return [
        createColoredImageFile("#FF0000", "red.png"),
        createColoredImageFile("#0000FF", "blue.png"),
        createColoredImageFile("#00FF00", "green.png"),
    ];
};

function createQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: 0,
            },
        },
    });
}

const StoryWrapper = ({
    Story,
    status = "ready",
    selectedFiles = [],
    isUploadingFiles = false,
    rateLimitMessages,
    rateLimitFiles,
    isOwner = true,
    visibility,
}: {
    Story: React.ComponentType;
    status?: ChatStatus;
    selectedFiles?: File[];
    isUploadingFiles?: boolean;
    rateLimitMessages?: UserMessagesRateLimitResult;
    rateLimitFiles?: UserFilesRateLimitResult;
    isOwner?: boolean;
    visibility?: DBChatVisibility;
}) => {
    const queryClient = useMemo(() => createQueryClient(), []);
    const [files, setFiles] = useState<File[]>(selectedFiles);
    const [uploadedFiles] = useState<any[]>([]);

    const chatFilesContextValue = useMemo(
        () => ({
            selectedFiles: files,
            uploadedFiles,
            isUploadingFiles,
            handleFileSelect: fn((newFiles: File[]) => {
                setFiles(prev => [...prev, ...newFiles]);
            }),
            handleFileRemove: fn((file: File) => {
                setFiles(prev => prev.filter(f => f !== file));
            }),
        }),
        [files, uploadedFiles, isUploadingFiles],
    );

    const chatHandlersContextValue = useMemo(
        () => ({
            handleSendMessage: fn(),
            handleStop: fn(),
            handleUserRegenerate: fn(),
            handleAssistantRegenerate: fn(),
        }),
        [],
    );

    const chatStatusContextValue = useMemo(
        () => ({
            status,
            error: undefined,
            isStreaming: status === "streaming",
            isSubmitted: status === "submitted",
            isReady: status === "ready",
            isError: status === "error",
        }),
        [status],
    );

    const chatMessagesRateLimitContextValue = useMemo(
        () => ({
            rateLimit: rateLimitMessages,
            isLoading: false,
            isPending: false,
            error: null,
        }),
        [rateLimitMessages],
    );

    const chatFilesRateLimitContextValue = useMemo(
        () => ({
            rateLimit: rateLimitFiles,
            isLoading: false,
            isPending: false,
            error: null,
        }),
        [rateLimitFiles],
    );

    return (
        <QueryClientProvider client={queryClient}>
            <UserSessionProvider>
                <SessionSyncProvider>
                    <ChatOffsetProvider>
                        <UserCacheSyncProvider>
                            <ChatCacheSyncProvider>
                                <ChatSidebarProvider>
                                    <ChatProvider
                                        userId={mockUserId}
                                        isNewChat={false}
                                        isOwner={isOwner}
                                        visibility={visibility}
                                        chatId={mockChatId}
                                        messages={[]}
                                        userChatPreferences={null}
                                    >
                                        <ChatStatusContext.Provider
                                            value={chatStatusContextValue}
                                        >
                                            <ChatFilesContext.Provider
                                                value={chatFilesContextValue}
                                            >
                                                <ChatHandlersContext.Provider
                                                    value={
                                                        chatHandlersContextValue
                                                    }
                                                >
                                                    <ChatMessagesRateLimitContext.Provider
                                                        value={
                                                            chatMessagesRateLimitContextValue
                                                        }
                                                    >
                                                        <ChatFilesRateLimitContext.Provider
                                                            value={
                                                                chatFilesRateLimitContextValue
                                                            }
                                                        >
                                                            <div className="bg-zinc-925 grid min-h-svh w-full items-center">
                                                                <Story />
                                                            </div>
                                                        </ChatFilesRateLimitContext.Provider>
                                                    </ChatMessagesRateLimitContext.Provider>
                                                </ChatHandlersContext.Provider>
                                            </ChatFilesContext.Provider>
                                        </ChatStatusContext.Provider>
                                    </ChatProvider>
                                </ChatSidebarProvider>
                            </ChatCacheSyncProvider>
                        </UserCacheSyncProvider>
                    </ChatOffsetProvider>
                </SessionSyncProvider>
            </UserSessionProvider>
        </QueryClientProvider>
    );
};

const meta = preview.meta({
    component: MemoizedChatComposer,
    decorators: [Story => <StoryWrapper Story={Story} />],
    parameters: {
        layout: "fullscreen",
    },
});

export const Default = meta.story({
    name: "Default",
});

Default.test("should render message input textarea", async ({ canvas }) => {
    const textarea = canvas.getByRole("textbox");
    expect(textarea).toBeInTheDocument();
});

Default.test("should have disabled send button", async ({ canvas }) => {
    const sendButton = canvas.getByRole("button", { name: "Send" });
    expect(sendButton).toBeDisabled();
});

Default.test(
    "should have disabled send button when message is too long",
    async ({ canvas, userEvent }) => {
        const textarea = canvas.getByRole("textbox");
        const text = "a".repeat(10000);
        await userEvent.clear(textarea);
        await userEvent.paste(text);
        const sendButton = canvas.getByRole("button", { name: "Send" });
        expect(sendButton).toBeDisabled();
    },
);

Default.test(
    "should be able to type in textarea",
    async ({ canvas, userEvent }) => {
        const textarea = canvas.getByRole("textbox");
        await userEvent.type(textarea, "Hello, world!");
        expect(textarea).toHaveValue("Hello, world!");
    },
);

Default.test(
    "should disable send button after submitting message",
    async ({ canvas, userEvent }) => {
        const textarea = canvas.getByRole("textbox");
        await userEvent.type(textarea, "Hello, world!");
        const sendButton = canvas.getByRole("button", { name: "Send" });
        await userEvent.click(sendButton);
        expect(sendButton).toBeDisabled();
    },
);

Default.test(
    "should submit message when Enter key is pressed",
    async ({ canvas, userEvent }) => {
        const textarea = canvas.getByRole("textbox");
        await userEvent.type(textarea, "Hello, world!");
        await userEvent.keyboard("{enter}");
    },
);

Default.test(
    "should reset textarea when message is submitted",
    async ({ canvas, userEvent }) => {
        const textarea = canvas.getByRole("textbox");
        await userEvent.type(textarea, "Hello, world!");
        await userEvent.keyboard("{enter}");
        expect(textarea).toHaveValue("");
    },
);

Default.test("should attach an image file", async ({ canvas, userEvent }) => {
    const fileButton = canvas.getByRole("button", { name: "Attach a file" });
    expect(fileButton).toBeInTheDocument();

    const fileInput = document.querySelector(
        'input[type="file"]',
    ) as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();

    const imageFile = createColoredImageFile("#FF0000", "test-image.png");

    Object.defineProperty(fileInput, "files", {
        value: [imageFile],
        writable: false,
    });

    const changeEvent = new Event("change", { bubbles: true });
    fileInput.dispatchEvent(changeEvent);

    await waitFor(() => {
        const image = canvas.getByAltText("test-image.png");
        expect(image).toBeInTheDocument();
    });
});

Default.test("should attach a file", async ({ canvas }) => {
    const fileButton = canvas.getByRole("button", { name: "Attach a file" });
    expect(fileButton).toBeInTheDocument();

    const fileInput = document.querySelector(
        'input[type="file"]',
    ) as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();

    const textFile = new File(["file content"], "document.txt", {
        type: "text/plain",
    });

    Object.defineProperty(fileInput, "files", {
        value: [textFile],
        writable: false,
    });

    const changeEvent = new Event("change", { bubbles: true });
    fileInput.dispatchEvent(changeEvent);

    await waitFor(() => {
        const filesPreview = canvas.getByText("document.txt");
        expect(filesPreview).toBeInTheDocument();
    });
});

Default.test("should attach multiple files", async ({ canvas }) => {
    const fileButton = canvas.getByRole("button", { name: "Attach a file" });
    expect(fileButton).toBeInTheDocument();

    const fileInput = document.querySelector(
        'input[type="file"]',
    ) as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();

    const files = [
        new File(["content1"], "file1.txt", { type: "text/plain" }),
        new File(["content2"], "file2.pdf", { type: "application/pdf" }),
        new File(["content3"], "file3.tsx", { type: "text/typescript" }),
    ];

    Object.defineProperty(fileInput, "files", {
        value: files,
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
    const fileButton = canvas.getByRole("button", { name: "Attach a file" });
    expect(fileButton).toBeInTheDocument();

    const fileInput = document.querySelector(
        'input[type="file"]',
    ) as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();

    const images = [
        createColoredImageFile("#FF0000", "red.png"),
        createColoredImageFile("#0000FF", "blue.png"),
        createColoredImageFile("#00FF00", "green.png"),
    ];

    Object.defineProperty(fileInput, "files", {
        value: images,
        writable: false,
    });

    const changeEvent = new Event("change", { bubbles: true });
    fileInput.dispatchEvent(changeEvent);

    await waitFor(() => {
        const imageElements = canvas.getAllByRole("img");
        expect(imageElements.length).toBeGreaterThanOrEqual(3);
        expect(canvas.getByAltText("red.png")).toBeInTheDocument();
        expect(canvas.getByAltText("blue.png")).toBeInTheDocument();
        expect(canvas.getByAltText("green.png")).toBeInTheDocument();
    });
});

Default.test("should attach files and images together", async ({ canvas }) => {
    const fileButton = canvas.getByRole("button", {
        name: "Attach a file",
    });
    expect(fileButton).toBeInTheDocument();

    const fileInput = document.querySelector(
        'input[type="file"]',
    ) as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();

    const filesAndImages = [
        createColoredImageFile("#FF0000", "image1.png"),
        new File(["content1"], "document1.txt", { type: "text/plain" }),
        createColoredImageFile("#0000FF", "image2.png"),
        new File(["content2"], "document2.pdf", {
            type: "application/pdf",
        }),
    ];

    Object.defineProperty(fileInput, "files", {
        value: filesAndImages,
        writable: false,
    });

    const changeEvent = new Event("change", { bubbles: true });
    fileInput.dispatchEvent(changeEvent);

    await waitFor(() => {
        expect(canvas.getByAltText("image1.png")).toBeInTheDocument();
        expect(canvas.getByAltText("image2.png")).toBeInTheDocument();
        expect(canvas.getByText("document1.txt")).toBeInTheDocument();
        expect(canvas.getByText("document2.pdf")).toBeInTheDocument();
    });
});

Default.test("should remove a file", async ({ canvas, userEvent }) => {
    const fileButton = canvas.getByRole("button", { name: "Attach a file" });
    expect(fileButton).toBeInTheDocument();

    const fileInput = document.querySelector(
        'input[type="file"]',
    ) as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();

    const textFile = new File(["file content"], "document.txt", {
        type: "text/plain",
    });

    Object.defineProperty(fileInput, "files", {
        value: [textFile],
        writable: false,
    });

    const changeEvent = new Event("change", { bubbles: true });
    fileInput.dispatchEvent(changeEvent);

    await waitFor(() => {
        expect(canvas.getByText("document.txt")).toBeInTheDocument();
    });

    const removeButton = canvas.getByRole("button", {
        name: /remove file document\.txt/i,
    });
    expect(removeButton).toBeInTheDocument();

    await userEvent.click(removeButton);

    await waitFor(() => {
        const fileText = canvas.queryByText("document.txt");
        expect(fileText).not.toBeInTheDocument();
    });
});

Default.test("should remove an image", async ({ canvas, userEvent }) => {
    const fileButton = canvas.getByRole("button", { name: "Attach a file" });
    expect(fileButton).toBeInTheDocument();

    const fileInput = document.querySelector(
        'input[type="file"]',
    ) as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();

    const imageFile = createColoredImageFile("#FF0000", "test-image.png");

    Object.defineProperty(fileInput, "files", {
        value: [imageFile],
        writable: false,
    });

    const changeEvent = new Event("change", { bubbles: true });
    fileInput.dispatchEvent(changeEvent);

    await waitFor(() => {
        expect(canvas.getByAltText("test-image.png")).toBeInTheDocument();
    });

    const removeButton = canvas.getByRole("button", {
        name: /remove file test-image\.png/i,
    });
    expect(removeButton).toBeInTheDocument();

    await userEvent.click(removeButton);

    await waitFor(() => {
        const image = canvas.queryByAltText("test-image.png");
        expect(image).not.toBeInTheDocument();
    });
});

export const WithFiles = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                selectedFiles={[
                    new File(["content1"], "file1.txt", { type: "text/plain" }),
                    new File(["content2"], "file2.pdf", {
                        type: "application/pdf",
                    }),
                    new File(["content3"], "file3.tsx", {
                        type: "text/typescript",
                    }),
                    new File(["content4"], "file4.py", {
                        type: "text/python",
                    }),
                ]}
            />
        ),
    ],
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
    decorators: [
        Story => (
            <StoryWrapper Story={Story} selectedFiles={createImageFiles()} />
        ),
    ],
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
            expect(canvas.getByAltText("red.png")).toBeInTheDocument();
            expect(canvas.getByAltText("blue.png")).toBeInTheDocument();
            expect(canvas.getByAltText("green.png")).toBeInTheDocument();
        });
    },
);

export const WithFilesAndImages = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                selectedFiles={[
                    ...createImageFiles(),
                    new File(["content1"], "file1.txt", { type: "text/plain" }),
                    new File(["content2"], "file2.pdf", {
                        type: "application/pdf",
                    }),
                ]}
            />
        ),
    ],
});

WithFilesAndImages.test(
    "should show both files and images preview",
    async ({ canvas }) => {
        await waitFor(() => {
            expect(canvas.getByAltText("red.png")).toBeInTheDocument();
            expect(canvas.getByAltText("blue.png")).toBeInTheDocument();
            expect(canvas.getByAltText("green.png")).toBeInTheDocument();
            expect(canvas.getByText("file1.txt")).toBeInTheDocument();
            expect(canvas.getByText("file2.pdf")).toBeInTheDocument();
        });
    },
);

export const WithFilesUploading = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                selectedFiles={[
                    new File(["content1"], "file1.txt", { type: "text/plain" }),
                ]}
                isUploadingFiles={true}
            />
        ),
    ],
});

export const WithImagesUploading = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                selectedFiles={createImageFiles()}
                isUploadingFiles={true}
            />
        ),
    ],
});

export const Streaming = meta.story({
    decorators: [Story => <StoryWrapper Story={Story} status="streaming" />],
});

Streaming.test("should show stop button", async ({ canvas }) => {
    const stopButton = canvas.getByRole("button", {
        name: "Stop",
    });
    expect(stopButton).toBeInTheDocument();
});

Streaming.test("should have disabled file button", async ({ canvas }) => {
    const fileButton = canvas.getByRole("button", {
        name: "Attach a file",
    });
    expect(fileButton).toBeDisabled();
});

export const Submitted = meta.story({
    name: "Submitted",
    decorators: [Story => <StoryWrapper Story={Story} status="submitted" />],
});

Submitted.test("should show stop button", async ({ canvas }) => {
    const stopButton = canvas.getByRole("button", {
        name: "Stop",
    });
    expect(stopButton).toBeInTheDocument();
});

Submitted.test("should have disabled file button", async ({ canvas }) => {
    const fileButton = canvas.getByRole("button", {
        name: "Attach a file",
    });
    expect(fileButton).toBeDisabled();
});

export const RateLimitExceeded = meta.story({
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                rateLimitMessages={{
                    isOverLimit: true,
                    reason: "messages",
                    periodStart: fixedDate.toISOString(),
                    periodEnd: fixedDate.toISOString(),
                    tokensCounter: 1000,
                    messagesCounter: 50,
                }}
            />
        ),
    ],
});

RateLimitExceeded.test("should display rate limit info", async ({ canvas }) => {
    const rateLimit = canvas.getByTestId("chat-composer-rate-limit");
    expect(rateLimit).toBeInTheDocument();
});

RateLimitExceeded.test(
    "should have disabled send button",
    async ({ canvas }) => {
        const sendButton = canvas.getByRole("button", { name: "Send" });
        expect(sendButton).toBeDisabled();
    },
);

RateLimitExceeded.test(
    "should have disabled file button",
    async ({ canvas }) => {
        const fileButton = canvas.getByRole("button", {
            name: "Attach a file",
        });
        expect(fileButton).toBeDisabled();
    },
);

RateLimitExceeded.test(
    "should close rate limit info when close button is clicked",
    async ({ canvas, userEvent }) => {
        const closeButton = canvas.getByRole("button", {
            name: "Close rate limit info",
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
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                rateLimitFiles={{
                    isOverLimit: true,
                    reason: "files",
                    periodStart: fixedDate.toISOString(),
                    periodEnd: fixedDate.toISOString(),
                    filesCounter: 10,
                }}
            />
        ),
    ],
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
        const sendButton = canvas.getByRole("button", { name: "Send" });
        expect(sendButton).toBeDisabled();
    },
);

FilesRateLimitExceeded.test(
    "should have disabled file button",
    async ({ canvas }) => {
        const fileButton = canvas.getByRole("button", {
            name: "Attach a file",
        });
        expect(fileButton).toBeDisabled();
    },
);

FilesRateLimitExceeded.test(
    "should close rate limit info when close button is clicked",
    async ({ canvas, userEvent }) => {
        const closeButton = canvas.getByRole("button", {
            name: "Close rate limit info",
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
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                isOwner={false}
                visibility={CHAT_VISIBILITY.PUBLIC}
            />
        ),
    ],
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
    decorators: [
        Story => (
            <StoryWrapper
                Story={Story}
                isOwner={true}
                visibility={CHAT_VISIBILITY.PRIVATE}
            />
        ),
    ],
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

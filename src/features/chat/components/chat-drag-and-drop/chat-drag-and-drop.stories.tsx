import { MOCK_CHAT_ID } from "#.storybook/lib/mocks/chats";
import {
    createFile,
    createMockDataTransfer,
} from "#.storybook/lib/mocks/files";
import { MOCK_USER_ID } from "#.storybook/lib/mocks/users";
import { createQueryClient } from "#.storybook/lib/utils/query-client";
import preview from "#.storybook/preview";
import { QueryClientProvider } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { expect, fn, waitFor } from "storybook/test";

import { SessionSyncProvider } from "@/features/auth/providers";

import type { ChatUploadedFile } from "@/features/chat/lib/types";
import {
    ChatCacheSyncProvider,
    ChatFilesContext,
    ChatOffsetProvider,
    ChatProvider,
    ChatSidebarProvider,
} from "@/features/chat/providers";

import {
    UserCacheSyncProvider,
    UserSessionProvider,
} from "@/features/user/providers";

import { ChatDragAndDrop } from "./chat-drag-and-drop";

const StoryWrapper = ({
    Story,
    handleFileSelect,
}: {
    Story: React.ComponentType;
    handleFileSelect?: (files: File[]) => void;
}) => {
    const queryClient = useMemo(() => createQueryClient(), []);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploadedFiles] = useState<ChatUploadedFile[]>([]);
    const [isUploadingFiles] = useState(false);

    const mockHandleFileSelect =
        handleFileSelect ??
        fn((files: File[]) => {
            setSelectedFiles(prev => [...prev, ...files]);
        });

    const mockHandleFileRemove = fn((file: File) => {
        setSelectedFiles(prev => prev.filter(f => f !== file));
    });

    const chatFilesContextValue = useMemo(
        () => ({
            selectedFiles,
            uploadedFiles,
            isUploadingFiles,
            handleFileSelect: mockHandleFileSelect,
            handleFileRemove: mockHandleFileRemove,
        }),
        [
            selectedFiles,
            uploadedFiles,
            isUploadingFiles,
            mockHandleFileSelect,
            mockHandleFileRemove,
        ],
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
                                        userId={MOCK_USER_ID}
                                        isNewChat={false}
                                        isOwner={true}
                                        chatId={MOCK_CHAT_ID}
                                        messages={[]}
                                        userChatPreferences={null}
                                    >
                                        <ChatFilesContext.Provider
                                            value={chatFilesContextValue}
                                        >
                                            <div className="h-screen w-full bg-zinc-950">
                                                <Story />
                                            </div>
                                        </ChatFilesContext.Provider>
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
    component: ChatDragAndDrop,
    decorators: [Story => <StoryWrapper Story={Story} />],
    argTypes: {
        renderDragOverMessage: {
            control: false,
            description: "Custom component to render when dragging over",
        },
        className: {
            control: "text",
            description: "Additional CSS class for the container",
        },
    },
    parameters: {
        layout: "fullscreen",
    },
});

export const Default = meta.story({
    args: {
        children: (
            <div className="flex h-full items-center justify-center p-8">
                <p className="text-zinc-100">
                    Drag and drop files here to test the component
                </p>
            </div>
        ),
    },
});

Default.test("should render children", async ({ canvas }) => {
    const text = canvas.getByText(/drag and drop files here/i);
    expect(text).toBeInTheDocument();
});

Default.test(
    "should show drag over message when dragging",
    async ({ canvas }) => {
        const container = canvas.getByTestId("chat-drag-and-drop");
        expect(container).toBeInTheDocument();

        const dragEnterEvent = new DragEvent("dragenter", {
            bubbles: true,
            cancelable: true,
            dataTransfer: createMockDataTransfer(),
        });

        container.dispatchEvent(dragEnterEvent);

        await waitFor(() => {
            const message = canvas.getByTestId("chat-drag-and-drop-message");
            expect(message).toBeInTheDocument();
        });
    },
);

Default.test(
    "should hide drag over message when drag leaves",
    async ({ canvas }) => {
        const container = canvas.getByTestId("chat-drag-and-drop");
        expect(container).toBeInTheDocument();

        const dragEnterEvent = new DragEvent("dragenter", {
            bubbles: true,
            cancelable: true,
            dataTransfer: createMockDataTransfer(),
        });
        container.dispatchEvent(dragEnterEvent);

        await waitFor(() => {
            const message = canvas.getByTestId("chat-drag-and-drop-message");
            expect(message).toBeInTheDocument();
        });

        const dragLeaveEvent = new DragEvent("dragleave", {
            bubbles: true,
            cancelable: true,
            relatedTarget: null,
        });
        container.dispatchEvent(dragLeaveEvent);

        await waitFor(() => {
            const message = canvas.queryByTestId("chat-drag-and-drop-message");
            expect(message).not.toBeInTheDocument();
        });
    },
);

Default.test("should call handleFileSelect on drop", async ({ canvas }) => {
    const container = canvas.getByTestId("chat-drag-and-drop");
    expect(container).toBeInTheDocument();

    const file1 = createFile({ filename: "file1.txt", content: "content1" });
    const file2 = createFile({ filename: "file2.txt", content: "content2" });

    const dropEvent = new DragEvent("drop", {
        bubbles: true,
        cancelable: true,
        dataTransfer: createMockDataTransfer([file1, file2]),
    });
    container.dispatchEvent(dropEvent);

    await waitFor(() => {
        expect(container).toBeInTheDocument();
    });
});

export const WithCustomDragOverMessage = meta.story({
    args: {
        renderDragOverMessage: (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-blue-900/60">
                <div className="rounded-lg bg-blue-800 p-4 text-white">
                    Custom drag over message
                </div>
            </div>
        ),
        children: (
            <div className="flex h-full items-center justify-center p-8">
                <p className="text-zinc-100">
                    Drag and drop files here to test custom message
                </p>
            </div>
        ),
    },
});

WithCustomDragOverMessage.test(
    "should show custom drag over message",
    async ({ canvas }) => {
        const container = canvas.getByTestId("chat-drag-and-drop");
        expect(container).toBeInTheDocument();

        const dragEnterEvent = new DragEvent("dragenter", {
            bubbles: true,
            cancelable: true,
            dataTransfer: createMockDataTransfer(),
        });
        container.dispatchEvent(dragEnterEvent);

        await waitFor(() => {
            const customMessage = canvas.getByText(/custom drag over message/i);
            expect(customMessage).toBeInTheDocument();
        });
    },
);

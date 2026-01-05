import { act, renderHook, waitFor } from "@testing-library/react";
import { toast } from "sonner";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { chatFileListUploadSchema } from "@/features/chat/lib/schemas";
import type { ChatUploadedFile, DBChatId } from "@/features/chat/lib/types";
import {
    deleteUserFile,
    deleteUserFiles,
    uploadUserFiles,
} from "@/features/chat/services/actions";
import { generateChatId } from "@/vitest/helpers/generate-test-ids";

import { getParseErrors } from "@/lib/utils";

import { useEventListener } from "@/hooks";

import { useChatFiles } from "./use-chat-files";

vi.mock("@/features/chat/lib/schemas", () => ({
    chatFileListUploadSchema: {
        safeParseAsync: vi.fn(),
    },
}));

vi.mock("@/features/chat/services/actions", () => ({
    uploadUserFiles: vi.fn(),
    deleteUserFile: vi.fn(),
    deleteUserFiles: vi.fn(),
}));

vi.mock("@/hooks", () => ({
    useEventListener: vi.fn(),
}));

vi.mock("@/lib/utils", () => ({
    getParseErrors: vi.fn(),
}));

vi.mock("sonner", () => ({
    toast: {
        error: vi.fn(),
    },
}));

const mockChatFileListUploadSchema = vi.mocked(chatFileListUploadSchema);
const mockUploadUserFiles = vi.mocked(uploadUserFiles);
const mockDeleteUserFile = vi.mocked(deleteUserFile);
const mockDeleteUserFiles = vi.mocked(deleteUserFiles);
const mockUseEventListener = vi.mocked(useEventListener);
const mockGetParseErrors = vi.mocked(getParseErrors);
const mockToastError = vi.mocked(toast.error);

describe("useChatFiles", () => {
    const chatId = generateChatId();
    let mockBeforeUnloadHandler: (() => void) | undefined;
    let originalSendBeacon: typeof navigator.sendBeacon;

    beforeEach(() => {
        vi.clearAllMocks();

        originalSendBeacon = navigator.sendBeacon;
        Object.defineProperty(navigator, "sendBeacon", {
            value: vi.fn().mockReturnValue(true),
            writable: true,
            configurable: true,
        });

        mockUseEventListener.mockImplementation((event, handler) => {
            if (event === "beforeunload") {
                mockBeforeUnloadHandler = handler as () => void;
            }
            return undefined;
        });
    });

    afterEach(() => {
        Object.defineProperty(navigator, "sendBeacon", {
            value: originalSendBeacon,
            writable: true,
            configurable: true,
        });
    });

    it("should return initial state with empty files and not uploading", () => {
        const { result } = renderHook(() =>
            useChatFiles({ isSubmitted: false, chatId }),
        );

        expect(result.current.selectedFiles).toEqual([]);
        expect(result.current.uploadedFiles).toEqual([]);
        expect(result.current.isUploadingFiles).toBe(false);
        expect(typeof result.current.handleFileSelect).toBe("function");
        expect(typeof result.current.handleFileRemove).toBe("function");
        expect(typeof result.current.handleClearFiles).toBe("function");
        expect(typeof result.current.clearUploadedFiles).toBe("function");
        expect(typeof result.current.clearSelectedFiles).toBe("function");
    });

    it("should select and upload files successfully", async () => {
        const files = [
            new File(["content"], "file1.txt", { type: "text/plain" }),
            new File(["content"], "file2.txt", { type: "text/plain" }),
        ];
        const uploadedFiles: ChatUploadedFile[] = [
            {
                kind: "file" as any,
                fileId: "id1",
                name: "file1.txt",
                fileUrl: "url1",
                mediaType: "text/plain",
                extension: "txt",
                size: 100,
            },
            {
                kind: "file" as any,
                fileId: "id2",
                name: "file2.txt",
                fileUrl: "url2",
                mediaType: "text/plain",
                extension: "txt",
                size: 100,
            },
        ];

        mockChatFileListUploadSchema.safeParseAsync.mockResolvedValue({
            success: true,
            data: files,
        } as any);
        mockUploadUserFiles.mockResolvedValue({
            success: true,
            data: uploadedFiles,
        } as any);

        const { result } = renderHook(() =>
            useChatFiles({ isSubmitted: false, chatId }),
        );

        await act(async () => {
            await result.current.handleFileSelect(files);
        });

        await waitFor(() => {
            expect(result.current.selectedFiles).toEqual(files);
            expect(result.current.uploadedFiles).toEqual(uploadedFiles);
            expect(result.current.isUploadingFiles).toBe(false);
        });
    });

    it("should show error toast when file validation fails", async () => {
        const files = [new File(["content"], "file1.txt")];
        const errorMessages = ["File too large", "Invalid file type"];

        mockChatFileListUploadSchema.safeParseAsync.mockResolvedValue({
            success: false,
            error: {},
        } as any);
        mockGetParseErrors.mockReturnValue(errorMessages);

        const { result } = renderHook(() =>
            useChatFiles({ isSubmitted: false, chatId }),
        );

        await act(async () => {
            await result.current.handleFileSelect(files);
        });

        expect(mockToastError).toHaveBeenCalledWith(errorMessages.join("\n"), {
            duration: 6_000,
        });
        expect(result.current.selectedFiles).toEqual([]);
        expect(result.current.uploadedFiles).toEqual([]);
    });

    it("should show error toast when upload fails", async () => {
        const files = [new File(["content"], "file1.txt")];
        const errorMessage = "Upload failed";

        mockChatFileListUploadSchema.safeParseAsync.mockResolvedValue({
            success: true,
            data: files,
        } as any);
        mockUploadUserFiles.mockResolvedValue({
            success: false,
            message: errorMessage,
        } as any);

        const { result } = renderHook(() =>
            useChatFiles({ isSubmitted: false, chatId }),
        );

        await act(async () => {
            await result.current.handleFileSelect(files);
        });

        await waitFor(() => {
            expect(result.current.isUploadingFiles).toBe(false);
        });

        expect(mockToastError).toHaveBeenCalledWith(errorMessage, {
            duration: 6_000,
        });
        expect(result.current.selectedFiles).toEqual(files);
        expect(result.current.uploadedFiles).toEqual([]);
    });

    it("should show error toast when exception occurs during file select", async () => {
        const files = [new File(["content"], "file1.txt")];

        mockChatFileListUploadSchema.safeParseAsync.mockRejectedValue(
            new Error("Unexpected error"),
        );

        const { result } = renderHook(() =>
            useChatFiles({ isSubmitted: false, chatId }),
        );

        await act(async () => {
            await result.current.handleFileSelect(files);
        });

        await waitFor(() => {
            expect(result.current.isUploadingFiles).toBe(false);
        });

        expect(mockToastError).toHaveBeenCalledWith(
            "An error occurred while processing the files.",
            { duration: 6_000 },
        );
    });

    it("should remove file and delete it from storage", async () => {
        const file = new File(["content"], "file1.txt");
        const uploadedFiles: ChatUploadedFile[] = [
            {
                kind: "file" as any,
                fileId: "id1",
                name: "file1.txt",
                fileUrl: "url1",
                mediaType: "text/plain",
                extension: "txt",
                size: 100,
            },
        ];

        mockChatFileListUploadSchema.safeParseAsync.mockResolvedValue({
            success: true,
            data: [file],
        } as any);
        mockUploadUserFiles.mockResolvedValue({
            success: true,
            data: uploadedFiles,
        } as any);

        const { result } = renderHook(() =>
            useChatFiles({ isSubmitted: false, chatId }),
        );

        await act(async () => {
            await result.current.handleFileSelect([file]);
        });

        await waitFor(() => {
            expect(result.current.uploadedFiles).toEqual(uploadedFiles);
        });

        act(() => {
            result.current.handleFileRemove(file);
        });

        await waitFor(() => {
            expect(result.current.selectedFiles).toEqual([]);
            expect(result.current.uploadedFiles).toEqual(uploadedFiles);
        });

        expect(mockDeleteUserFile).toHaveBeenCalledWith({
            storedFile: uploadedFiles[0],
            chatId,
        });
    });

    it("should not remove file if it is not in uploaded files", () => {
        const file = new File(["content"], "file1.txt");

        const { result } = renderHook(() =>
            useChatFiles({ isSubmitted: false, chatId }),
        );

        act(() => {
            result.current.handleFileRemove(file);
        });

        expect(mockDeleteUserFile).not.toHaveBeenCalled();
        expect(result.current.selectedFiles).toEqual([]);
    });

    it("should clear all files when handleClearFiles is called", async () => {
        const file = new File(["content"], "file1.txt");
        const uploadedFiles: ChatUploadedFile[] = [
            {
                kind: "file" as any,
                fileId: "id1",
                name: "file1.txt",
                fileUrl: "url1",
                mediaType: "text/plain",
                extension: "txt",
                size: 100,
            },
        ];

        mockChatFileListUploadSchema.safeParseAsync.mockResolvedValue({
            success: true,
            data: [file],
        } as any);
        mockUploadUserFiles.mockResolvedValue({
            success: true,
            data: uploadedFiles,
        } as any);

        const { result } = renderHook(() =>
            useChatFiles({ isSubmitted: false, chatId }),
        );

        await act(async () => {
            await result.current.handleFileSelect([file]);
        });

        await waitFor(() => {
            expect(result.current.uploadedFiles).toEqual(uploadedFiles);
        });

        act(() => {
            result.current.handleClearFiles();
        });

        expect(result.current.selectedFiles).toEqual([]);
        expect(result.current.uploadedFiles).toEqual([]);
    });

    it("should clear only uploaded files when clearUploadedFiles is called", async () => {
        const file = new File(["content"], "file1.txt");
        const uploadedFiles: ChatUploadedFile[] = [
            {
                kind: "file" as any,
                fileId: "id1",
                name: "file1.txt",
                fileUrl: "url1",
                mediaType: "text/plain",
                extension: "txt",
                size: 100,
            },
        ];

        mockChatFileListUploadSchema.safeParseAsync.mockResolvedValue({
            success: true,
            data: [file],
        } as any);
        mockUploadUserFiles.mockResolvedValue({
            success: true,
            data: uploadedFiles,
        } as any);

        const { result } = renderHook(() =>
            useChatFiles({ isSubmitted: false, chatId }),
        );

        await act(async () => {
            await result.current.handleFileSelect([file]);
        });

        await waitFor(() => {
            expect(result.current.selectedFiles).toEqual([file]);
        });

        act(() => {
            result.current.clearUploadedFiles();
        });

        expect(result.current.uploadedFiles).toEqual([]);
        expect(result.current.selectedFiles).toEqual([file]);
    });

    it("should clear only selected files when clearSelectedFiles is called", async () => {
        const file = new File(["content"], "file1.txt");
        const uploadedFiles: ChatUploadedFile[] = [
            {
                kind: "file" as any,
                fileId: "id1",
                name: "file1.txt",
                fileUrl: "url1",
                mediaType: "text/plain",
                extension: "txt",
                size: 100,
            },
        ];

        mockChatFileListUploadSchema.safeParseAsync.mockResolvedValue({
            success: true,
            data: [file],
        } as any);
        mockUploadUserFiles.mockResolvedValue({
            success: true,
            data: uploadedFiles,
        } as any);

        const { result } = renderHook(() =>
            useChatFiles({ isSubmitted: false, chatId }),
        );

        await act(async () => {
            await result.current.handleFileSelect([file]);
        });

        await waitFor(() => {
            expect(result.current.uploadedFiles).toEqual(uploadedFiles);
        });

        act(() => {
            result.current.clearSelectedFiles();
        });

        expect(result.current.selectedFiles).toEqual([]);
        expect(result.current.uploadedFiles).toEqual(uploadedFiles);
    });

    it("should delete uploaded files on unmount if not submitted", async () => {
        const file = new File(["content"], "file1.txt");
        const uploadedFiles: ChatUploadedFile[] = [
            {
                kind: "file" as any,
                fileId: "id1",
                name: "file1.txt",
                fileUrl: "url1",
                mediaType: "text/plain",
                extension: "txt",
                size: 100,
            },
        ];

        mockChatFileListUploadSchema.safeParseAsync.mockResolvedValue({
            success: true,
            data: [file],
        } as any);
        mockUploadUserFiles.mockResolvedValue({
            success: true,
            data: uploadedFiles,
        } as any);

        const { result, unmount } = renderHook(() =>
            useChatFiles({ isSubmitted: false, chatId }),
        );

        await act(async () => {
            await result.current.handleFileSelect([file]);
        });

        await waitFor(() => {
            expect(result.current.uploadedFiles).toEqual(uploadedFiles);
        });

        unmount();

        expect(mockDeleteUserFiles).toHaveBeenCalledWith({
            chatId,
            storedFiles: uploadedFiles,
        });
    });

    it("should not delete files on unmount if submitted", async () => {
        const file = new File(["content"], "file1.txt");
        const uploadedFiles: ChatUploadedFile[] = [
            {
                kind: "file" as any,
                fileId: "id1",
                name: "file1.txt",
                fileUrl: "url1",
                mediaType: "text/plain",
                extension: "txt",
                size: 100,
            },
        ];

        mockChatFileListUploadSchema.safeParseAsync.mockResolvedValue({
            success: true,
            data: [file],
        } as any);
        mockUploadUserFiles.mockResolvedValue({
            success: true,
            data: uploadedFiles,
        } as any);

        const { result, rerender, unmount } = renderHook(
            ({ isSubmitted }) => useChatFiles({ isSubmitted, chatId }),
            {
                initialProps: { isSubmitted: false },
            },
        );

        await act(async () => {
            await result.current.handleFileSelect([file]);
        });

        await waitFor(() => {
            expect(result.current.uploadedFiles).toEqual(uploadedFiles);
        });

        rerender({ isSubmitted: true });

        unmount();

        expect(mockDeleteUserFiles).not.toHaveBeenCalled();
    });

    it("should not delete files on unmount if files were cleared", async () => {
        const file = new File(["content"], "file1.txt");
        const uploadedFiles: ChatUploadedFile[] = [
            {
                kind: "file" as any,
                fileId: "id1",
                name: "file1.txt",
                fileUrl: "url1",
                mediaType: "text/plain",
                extension: "txt",
                size: 100,
            },
        ];

        mockChatFileListUploadSchema.safeParseAsync.mockResolvedValue({
            success: true,
            data: [file],
        } as any);
        mockUploadUserFiles.mockResolvedValue({
            success: true,
            data: uploadedFiles,
        } as any);

        const { result, unmount } = renderHook(() =>
            useChatFiles({ isSubmitted: false, chatId }),
        );

        await act(async () => {
            await result.current.handleFileSelect([file]);
        });

        await waitFor(() => {
            expect(result.current.uploadedFiles).toEqual(uploadedFiles);
        });

        act(() => {
            result.current.handleClearFiles();
        });

        unmount();

        expect(mockDeleteUserFiles).not.toHaveBeenCalled();
    });

    it("should send beacon on beforeunload if files are uploaded and not submitted", async () => {
        const file = new File(["content"], "file1.txt");
        const uploadedFiles: ChatUploadedFile[] = [
            {
                kind: "file" as any,
                fileId: "id1",
                name: "file1.txt",
                fileUrl: "url1",
                mediaType: "text/plain",
                extension: "txt",
                size: 100,
            },
        ];

        mockChatFileListUploadSchema.safeParseAsync.mockResolvedValue({
            success: true,
            data: [file],
        } as any);
        mockUploadUserFiles.mockResolvedValue({
            success: true,
            data: uploadedFiles,
        } as any);

        const { result } = renderHook(() =>
            useChatFiles({ isSubmitted: false, chatId }),
        );

        await act(async () => {
            await result.current.handleFileSelect([file]);
        });

        await waitFor(() => {
            expect(result.current.uploadedFiles).toEqual(uploadedFiles);
        });

        act(() => {
            mockBeforeUnloadHandler?.();
        });

        expect(navigator.sendBeacon).toHaveBeenCalledWith(
            "/api/chat/delete-files",
            JSON.stringify({
                files: uploadedFiles,
                chatId,
            }),
        );
    });

    it("should not send beacon on beforeunload if submitted", async () => {
        const file = new File(["content"], "file1.txt");
        const uploadedFiles: ChatUploadedFile[] = [
            {
                kind: "file" as any,
                fileId: "id1",
                name: "file1.txt",
                fileUrl: "url1",
                mediaType: "text/plain",
                extension: "txt",
                size: 100,
            },
        ];

        mockChatFileListUploadSchema.safeParseAsync.mockResolvedValue({
            success: true,
            data: [file],
        } as any);
        mockUploadUserFiles.mockResolvedValue({
            success: true,
            data: uploadedFiles,
        } as any);

        const { result, rerender } = renderHook(
            ({ isSubmitted }) => useChatFiles({ isSubmitted, chatId }),
            {
                initialProps: { isSubmitted: false },
            },
        );

        await act(async () => {
            await result.current.handleFileSelect([file]);
        });

        await waitFor(() => {
            expect(result.current.uploadedFiles).toEqual(uploadedFiles);
        });

        rerender({ isSubmitted: true });

        act(() => {
            mockBeforeUnloadHandler?.();
        });

        expect(navigator.sendBeacon).not.toHaveBeenCalled();
    });

    it("should not send beacon on beforeunload if files were cleared", async () => {
        const file = new File(["content"], "file1.txt");
        const uploadedFiles: ChatUploadedFile[] = [
            {
                kind: "file" as any,
                fileId: "id1",
                name: "file1.txt",
                fileUrl: "url1",
                mediaType: "text/plain",
                extension: "txt",
                size: 100,
            },
        ];

        mockChatFileListUploadSchema.safeParseAsync.mockResolvedValue({
            success: true,
            data: [file],
        } as any);
        mockUploadUserFiles.mockResolvedValue({
            success: true,
            data: uploadedFiles,
        } as any);

        const { result } = renderHook(() =>
            useChatFiles({ isSubmitted: false, chatId }),
        );

        await act(async () => {
            await result.current.handleFileSelect([file]);
        });

        await waitFor(() => {
            expect(result.current.uploadedFiles).toEqual(uploadedFiles);
        });

        act(() => {
            result.current.handleClearFiles();
        });

        act(() => {
            mockBeforeUnloadHandler?.();
        });

        expect(navigator.sendBeacon).not.toHaveBeenCalled();
    });
});

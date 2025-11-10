"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { chatFileListUploadSchema } from "@/features/chat/lib/schemas";
import { ChatUploadedFile, DBChatId } from "@/features/chat/lib/types";
import {
    deleteUserFile,
    deleteUserFiles,
    uploadUserFiles,
} from "@/features/chat/services/actions";

import { getParseErrors } from "@/lib/utils";

import { useEventListener } from "@/hooks";

type UseChatFilesProps = {
    isSubmitted: boolean;
    chatId: DBChatId;
};

export function useChatFiles({ isSubmitted, chatId }: UseChatFilesProps) {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<ChatUploadedFile[]>([]);
    const [isUploadingFiles, setIsUploadingFiles] = useState(false);
    const isSubmittedRef = useRef(false);
    const uploadedFilesRef = useRef(uploadedFiles);
    const filesWereClearedRef = useRef(false);

    useEffect(() => {
        isSubmittedRef.current = isSubmitted;
    }, [isSubmitted]);

    useEffect(() => {
        uploadedFilesRef.current = uploadedFiles;
    }, [uploadedFiles]);

    // Cleanup uploaded files on unmount if not submitted
    useEffect(() => {
        return () => {
            const filesToDelete = uploadedFilesRef.current;
            const wereCleared = filesWereClearedRef.current;

            if (
                filesToDelete.length <= 0 ||
                wereCleared ||
                isSubmittedRef.current
            ) {
                return;
            }

            deleteUserFiles({ chatId, storedFiles: filesToDelete });
        };
    }, [chatId]);

    // Cleanup files on page unload
    useEventListener("beforeunload", () => {
        if (
            uploadedFilesRef.current.length <= 0 ||
            filesWereClearedRef.current ||
            isSubmittedRef.current
        ) {
            return;
        }

        navigator.sendBeacon(
            "/api/chat/delete-files",
            JSON.stringify({
                files: uploadedFilesRef.current,
                chatId,
            }),
        );
    });

    const handleFileSelect = useCallback(
        async (files: File[]) => {
            try {
                const result = await chatFileListUploadSchema.safeParseAsync(
                    Array.from(files),
                );

                if (!result.success) {
                    const errorMessages = getParseErrors(result);

                    toast.error(errorMessages.join("\n"), {
                        duration: 6_000,
                    });
                    return;
                }

                setSelectedFiles(result.data);
                setIsUploadingFiles(true);
                filesWereClearedRef.current = false;

                const response = await uploadUserFiles({
                    files: result.data,
                    chatId,
                });

                if (!response.success) {
                    toast.error(response.message, {
                        duration: 6_000,
                    });
                    return;
                }

                setUploadedFiles(response.data);
            } catch {
                toast.error("An error occurred while processing the files.", {
                    duration: 6_000,
                });
            } finally {
                setIsUploadingFiles(false);
            }
        },
        [chatId],
    );

    const handleFileRemove = useCallback(
        (file: File) => {
            const storedFile = uploadedFiles.find(f => f.name === file.name);

            if (!storedFile) {
                return;
            }

            setSelectedFiles(prevFiles =>
                prevFiles.filter(f => f.name !== file.name),
            );

            deleteUserFile({ storedFile, chatId });
        },
        [uploadedFiles, chatId],
    );

    const handleClearFiles = useCallback(() => {
        filesWereClearedRef.current = true;
        setSelectedFiles([]);
        setUploadedFiles([]);
    }, []);

    const clearUploadedFiles = useCallback(() => {
        setUploadedFiles([]);
    }, []);

    const clearSelectedFiles = useCallback(() => {
        setSelectedFiles([]);
    }, []);

    return {
        selectedFiles,
        uploadedFiles,
        isUploadingFiles,
        handleFileSelect,
        handleFileRemove,
        handleClearFiles,
        clearUploadedFiles,
        clearSelectedFiles,
    };
}

"use client";

import { startTransition, useOptimistic, useState } from "react";
import { toast } from "sonner";

import type { DBChatId } from "@/features/chat/lib/types";
import { useChatCacheSyncContext } from "@/features/chat/providers";
import { updateChatTitle } from "@/features/chat/services/actions";

import { useClickOutside, useEventListener } from "@/hooks";

type UseRenameChatProps = {
    inputRef: React.RefObject<HTMLInputElement | null>;
    title: string;
    chatId: DBChatId;
    onSuccess?: () => Promise<void>;
    onError?: (error: string) => Promise<void>;
};

export function useChatRename({
    inputRef,
    title,
    chatId,
    onSuccess,
    onError,
}: UseRenameChatProps) {
    const [isRenaming, setIsRenaming] = useState(false);
    const [optimisticTitle, setOptimisticTitle] = useOptimistic(title);
    const chatCacheSync = useChatCacheSyncContext();

    useClickOutside(inputRef, handleRename, true);
    useEventListener("keydown", handleKeyDown, inputRef.current);

    function handleKeyDown(e: KeyboardEvent) {
        if (e.key === "Enter") {
            handleRename();
        } else if (e.key === "Escape") {
            cancelRenaming();
        }
    }

    function handleRename() {
        cancelRenaming();

        if (
            !isRenaming ||
            !inputRef.current ||
            inputRef.current.value === title ||
            inputRef.current.value.trim() === ""
        ) {
            return;
        }

        startTransition(async () => {
            if (!inputRef.current) return;
            const newTitle = inputRef.current.value.trim();

            setOptimisticTitle(newTitle);
            const response = await updateChatTitle({ chatId, newTitle });

            if (!response.success) {
                toast.error(response.message);
                setOptimisticTitle(title);
                await onError?.(response.message);
                return;
            }

            chatCacheSync.updateChatTitle({
                chatId,
                newTitle,
            });
            chatCacheSync.updateInitialUserChatsSearchTitle({
                chatId,
                newTitle,
            });
            chatCacheSync.invalidateSharedChats();
            await onSuccess?.();
        });
    }

    function startRenaming() {
        setIsRenaming(true);
    }

    function cancelRenaming() {
        setIsRenaming(false);
    }

    return {
        isRenaming,
        optimisticTitle,
        startRenaming,
        cancelRenaming,
        handleRename,
    };
}

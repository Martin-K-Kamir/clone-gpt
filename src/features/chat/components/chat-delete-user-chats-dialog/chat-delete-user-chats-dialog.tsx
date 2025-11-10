"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

import { useChatCacheSyncContext } from "@/features/chat/providers";
import { deleteAllUserChats } from "@/features/chat/services/actions";

type ChatDeleteUserChatsDialogProps = {
    redirectUrl?: string;
    showToast?: boolean;
    children?: React.ReactNode;
    onDelete?: () => void;
    onDeleteError?: (message: string, error?: Error) => void;
    onDeleteSuccess?: (message: string) => void;
};

export function ChatDeleteUserChatsDialog({
    redirectUrl = "/",
    showToast = true,
    children,
    onDelete,
    onDeleteError,
    onDeleteSuccess,
}: ChatDeleteUserChatsDialogProps) {
    const [open, setOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const chatCacheSync = useChatCacheSyncContext();
    const router = useRouter();

    async function handleDelete() {
        setIsDeleting(true);
        onDelete?.();
        const response = await deleteAllUserChats();

        if (!response.success) {
            onDeleteError?.(
                response.message,
                response.error instanceof Error ? response.error : undefined,
            );
            if (showToast) {
                toast.error(response.message);
            }
            setIsDeleting(false);
            return;
        }

        onDeleteSuccess?.(response.message);
        chatCacheSync.clearChats();
        chatCacheSync.clearInitialUserChatsSearch();
        setIsDeleting(false);
        setOpen(false);

        if (showToast) {
            toast.success(response.message);
        }

        if (window.location.pathname !== redirectUrl) {
            router.replace(redirectUrl);
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            {children ?? (
                <ChatDeleteAllDialogTrigger size="sm">
                    Delete All Chats
                </ChatDeleteAllDialogTrigger>
            )}
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete All Chats</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action will delete all your chats. This action is
                        irreversible. You will not be able to recover them.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        isLoading={isDeleting}
                    >
                        Delete All Chats
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export function ChatDeleteAllDialogTrigger({
    variant = "destructive",
    ...props
}: React.ComponentProps<typeof Button>) {
    return (
        <AlertDialogTrigger asChild>
            <Button variant={variant} {...props} />
        </AlertDialogTrigger>
    );
}

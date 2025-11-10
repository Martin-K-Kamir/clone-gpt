"use client";

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

import { useSessionSync } from "@/features/auth/providers";

import { deleteAllUserChats } from "@/features/chat/services/actions";

import { deleteUser } from "@/features/user/services/actions";

import { ApiErrorResponse } from "@/lib/api-response";

type UserDeleteProfileDialogProps = {
    showToast?: boolean;
    children?: React.ReactNode;
    onDelete?: () => void;
    onDeleteError?: (message: string, error?: Error) => void;
    onDeleteSuccess?: (message: string) => void;
};

export function UserDeleteProfileDialog({
    children,
    showToast = true,
    onDelete,
    onDeleteError,
    onDeleteSuccess,
}: UserDeleteProfileDialogProps) {
    const { signOutWithSync } = useSessionSync();
    const [open, setOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    function handleErrorResponse(response: ApiErrorResponse) {
        setIsDeleting(false);
        if (showToast) {
            toast.error(response.message);
        }
        onDeleteError?.(
            response.message,
            response.error instanceof Error ? response.error : undefined,
        );
    }

    async function handleDelete() {
        setIsDeleting(true);
        onDelete?.();

        // Delete chats first, then user (since user deletion invalidates session)
        const chatResponse = await deleteAllUserChats();

        if (!chatResponse.success) {
            handleErrorResponse(chatResponse);
            return;
        }

        const userResponse = await deleteUser();

        if (!userResponse.success) {
            handleErrorResponse(userResponse);
            return;
        }

        onDeleteSuccess?.(userResponse.message || chatResponse.message);
        toast.success(userResponse.message);
        setOpen(false);
        signOutWithSync();
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            {children ?? (
                <UserDeleteProfileDialogTrigger size="sm">
                    Delete Profile
                </UserDeleteProfileDialogTrigger>
            )}
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Profile</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action will delete your profile. This action is
                        irreversible. You will not be able to recover it.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button
                        variant="destructive"
                        disabled={isDeleting}
                        isLoading={isDeleting}
                        onClick={handleDelete}
                    >
                        Delete Profile
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export function UserDeleteProfileDialogTrigger({
    variant = "destructive",
    ...props
}: React.ComponentProps<typeof Button>) {
    return (
        <AlertDialogTrigger asChild>
            <Button variant={variant} {...props} />
        </AlertDialogTrigger>
    );
}

"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import { ChatDeleteUserChatsDialog } from "@/features/chat/components/chat-delete-user-chats-dialog";

import { UserDeleteProfileDialog } from "@/features/user/components/user-delete-profile-dialog";
import { UserProfileForm } from "@/features/user/components/user-profile-form";
import type { UIUser } from "@/features/user/lib/types";

import { useDialogState } from "@/hooks";

type UserProfileDialogProps = {
    user: UIUser;
} & React.ComponentProps<typeof Dialog>;

export function UserProfileDialog({
    user,
    children,
    ...props
}: UserProfileDialogProps) {
    const [open, onOpenChange] = useDialogState({
        ...props,
        dialogId: props.dialogId,
    });

    return (
        <Dialog {...props} open={open} onOpenChange={onOpenChange}>
            {children}
            <DialogContent
                ref={el => el?.focus()}
                className="focus-visible:ring-0"
            >
                <DialogHeader>
                    <DialogTitle>Profile Settings</DialogTitle>
                    <DialogDescription className="sr-only">
                        Manage your user settings and preferences.
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                    <UserProfileForm user={user} />

                    <Separator className="my-4 bg-zinc-700" />

                    <div className="flex items-center justify-between gap-4">
                        <p className="text-sm text-rose-400">
                            This action is irreversible and will permanently
                            delete your profile.
                        </p>
                        <UserDeleteProfileDialog />
                    </div>

                    <Separator className="my-4 bg-zinc-700" />

                    <div className="flex items-center justify-between gap-4">
                        <p className="text-sm text-rose-400">
                            This action is irreversible and will permanently
                            delete all your chats.
                        </p>
                        <ChatDeleteUserChatsDialog
                            onDeleteSuccess={() => {
                                onOpenChange?.(false);
                            }}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function UserProfileDialogTrigger(
    props: React.ComponentProps<typeof DialogTrigger>,
) {
    return <DialogTrigger {...props} />;
}

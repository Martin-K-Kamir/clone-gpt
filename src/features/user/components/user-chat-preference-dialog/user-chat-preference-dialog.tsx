"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { UserChatPreferenceForm } from "@/features/user/components/user-chat-preference-form";
import type { UIUser } from "@/features/user/lib/types";

import { useDialogState } from "@/hooks";

type UserChatPreferenceDialogProps = {
    user: UIUser;
} & React.ComponentProps<typeof Dialog>;

export function UserChatPreferenceDialog({
    children,
    user,
    ...props
}: UserChatPreferenceDialogProps) {
    const [open, onOpenChange] = useDialogState({
        ...props,
        dialogId: props.dialogId,
    });

    return (
        <Dialog {...props} open={open} onOpenChange={onOpenChange}>
            {children}
            <DialogContent className="focus-visible:ring-0">
                <DialogHeader>
                    <DialogTitle>Chat Preferences</DialogTitle>
                    <DialogDescription>
                        Introduce yourself and receive better, more personalized
                        answers.
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                    <UserChatPreferenceForm user={user} />
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function UserChatPreferenceDialogTrigger(
    props: React.ComponentProps<typeof DialogTrigger>,
) {
    return <DialogTrigger {...props} />;
}

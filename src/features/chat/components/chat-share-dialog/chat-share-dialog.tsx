"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { CopyInput } from "@/components/ui/copy-input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { SocialsList } from "@/components/ui/socials";
import { Switch } from "@/components/ui/switch";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import type { DBChatVisibility, UIChat } from "@/features/chat/lib/types";
import { useChatCacheSyncContext } from "@/features/chat/providers";
import { updateChatVisibility } from "@/features/chat/services/actions";

import {
    UserSharedChatsDialog,
    UserSharedChatsDialogTrigger,
} from "@/features/user/components/user-shared-chats-dialog";

import { absoluteUrl, cn } from "@/lib/utils";

import { useDebouncedEffect, usePrevious } from "@/hooks";

type ChatShareDialogProps = {
    chat: UIChat;
} & React.ComponentProps<typeof Dialog>;

export function ChatShareDialog({
    children,
    chat,
    ...props
}: ChatShareDialogProps) {
    const chatCacheSync = useChatCacheSyncContext();
    const [visibility, setVisibility] = useState<DBChatVisibility>(
        chat.visibility,
    );
    const prevVisibility = usePrevious(visibility);

    useEffect(() => {
        setVisibility(chat.visibility);
    }, [chat.visibility]);

    useDebouncedEffect(
        () => {
            if (visibility === chat.visibility) {
                return;
            }

            async function updateVisibility() {
                const response = await updateChatVisibility({
                    chatId: chat.id,
                    visibility,
                });

                if (!response.success) {
                    toast.error(response.message);
                    setVisibility(prevVisibility ?? visibility);
                    return;
                }

                chatCacheSync.updateChatVisibility({
                    chatId: chat.id,
                    visibility: response.data,
                });
                chatCacheSync.invalidateSharedChats();
            }

            updateVisibility();
        },
        [visibility],
        500,
    );

    return (
        <Dialog {...props}>
            {children}
            <DialogContent
                ref={el => el?.focus()}
                className="focus-visible:ring-0"
            >
                <DialogHeader>
                    <DialogTitle>Share Chat</DialogTitle>
                    <DialogDescription className="sr-only">
                        Share this chat with other users.
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-4 space-y-4">
                    <div className="flex items-center justify-between gap-2">
                        <div>
                            <Label htmlFor="switch">
                                Make this chat public to everyone
                            </Label>

                            <p className="mt-1 inline-block text-pretty text-sm text-zinc-400">
                                Previously shared chats can be managed{" "}
                                <UserSharedChatsDialog>
                                    <UserSharedChatsDialogTrigger className="cursor-pointer underline hover:text-zinc-50">
                                        here
                                    </UserSharedChatsDialogTrigger>
                                </UserSharedChatsDialog>
                            </p>
                        </div>

                        <Switch
                            id="switch"
                            checked={visibility === CHAT_VISIBILITY.PUBLIC}
                            onCheckedChange={checked => {
                                setVisibility(
                                    checked
                                        ? CHAT_VISIBILITY.PUBLIC
                                        : CHAT_VISIBILITY.PRIVATE,
                                );
                            }}
                        />
                    </div>

                    <div
                        className={cn(
                            "space-y-4",
                            visibility === CHAT_VISIBILITY.PRIVATE &&
                                "pointer-events-none cursor-not-allowed select-none opacity-50",
                        )}
                    >
                        <CopyInput
                            value={absoluteUrl(`/chat/${chat.id}`)}
                            label="Share this chat"
                            copyText="Copy Link"
                            disabled={visibility === CHAT_VISIBILITY.PRIVATE}
                        />
                        <SocialsList
                            url={absoluteUrl(`/chat/${chat.id}`)}
                            text={chat.title}
                            disabled={visibility === CHAT_VISIBILITY.PRIVATE}
                            onClick={e => {
                                e.stopPropagation();
                            }}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function ChatShareDialogTrigger(
    props: React.ComponentProps<typeof DialogTrigger>,
) {
    return <DialogTrigger {...props} />;
}

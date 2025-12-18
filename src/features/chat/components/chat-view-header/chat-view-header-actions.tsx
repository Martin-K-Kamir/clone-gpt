"use client";

import { IconDots, IconLogin, IconShare2 } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";

import {
    AuthSignInDialog,
    AuthSignInDialogTrigger,
} from "@/features/auth/components/auth-signin-dialog";

import {
    ChatItemDropdownMenu,
    ChatItemDropdownMenuTrigger,
} from "@/features/chat/components/chat-item-dropdown-menu";
import {
    ChatShareDialog,
    ChatShareDialogTrigger,
} from "@/features/chat/components/chat-share-dialog";
import { useChatIdParam } from "@/features/chat/hooks";
import { DBChat, DBChatId, WithIsOwner } from "@/features/chat/lib/types";
import { getUserChatById } from "@/features/chat/services/api";

import { USER_ROLE } from "@/features/user/lib/constants/user-roles";
import { DBUserRole } from "@/features/user/lib/types";

import { tag } from "@/lib/cache-tags";
import { cn } from "@/lib/utils";

type ChatViewHeaderActionsProps = {
    chatId?: DBChatId;
    userRole: DBUserRole;
    initialData?: (DBChat & WithIsOwner) | null;
} & Omit<React.ComponentProps<"div">, "children">;

export function ChatViewHeaderActions({
    chatId,
    userRole,
    initialData,
    className,
    ...props
}: ChatViewHeaderActionsProps) {
    const chatIdParam = useChatIdParam();
    const chatIdToUse = chatId ?? chatIdParam;

    const { data: chat } = useQuery({
        initialData,
        queryKey: [chatIdToUse ? tag.userChat(chatIdToUse) : null],
        queryFn: () =>
            chatIdToUse ? getUserChatById({ chatId: chatIdToUse }) : null,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        enabled: !!chatIdToUse,
    });

    return (
        <div
            className={cn("flex items-center gap-0.5 sm:gap-2", className)}
            {...props}
        >
            {userRole === USER_ROLE.GUEST && (
                <AuthSignInDialog>
                    <AuthSignInDialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="data-[state=open]:bg-transparent"
                        >
                            <IconLogin />
                            Log in
                        </Button>
                    </AuthSignInDialogTrigger>
                </AuthSignInDialog>
            )}
            {chat && chat.isOwner && (
                <>
                    <ChatShareDialog chat={chat}>
                        <ChatShareDialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="data-[state=open]:bg-transparent"
                            >
                                <IconShare2 />
                                Share
                            </Button>
                        </ChatShareDialogTrigger>
                    </ChatShareDialog>
                    <ChatItemDropdownMenu
                        chat={chat}
                        showShare={false}
                        showRename={false}
                        contentProps={{
                            align: "end",
                        }}
                    >
                        <ChatItemDropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="size-8"
                            >
                                <span className="sr-only">
                                    Open chat actions
                                </span>
                                <IconDots />
                            </Button>
                        </ChatItemDropdownMenuTrigger>
                    </ChatItemDropdownMenu>
                </>
            )}
        </div>
    );
}

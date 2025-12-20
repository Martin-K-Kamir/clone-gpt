"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useMediaQuery } from "usehooks-ts";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import {
    QUERY_USER_SHARED_CHATS_DESKTOP_LIMIT,
    QUERY_USER_SHARED_CHATS_MOBILE_LIMIT,
} from "@/features/chat/lib/constants";
import { getUserSharedChats } from "@/features/chat/services/api";

import { UserSharedChatsTable } from "@/features/user/components/user-shared-chats-table";

import { tag } from "@/lib/cache-tag";

export function UserSharedChatsDialog({
    children,
    ...props
}: React.ComponentProps<typeof Dialog>) {
    return (
        <Dialog {...props}>
            {children}
            <DialogContent className="focus-visible:ring-0 sm:max-w-[min(100%-2rem,_var(--container-3xl))]">
                <DialogHeader>
                    <DialogTitle>Shared Chats</DialogTitle>
                    <DialogDescription className="sr-only">
                        Manage your shared chats.
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                    <UserSharedChatsTable />
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function UserSharedChatsDialogTrigger(
    props: React.ComponentProps<typeof DialogTrigger>,
) {
    const isTallScreen = useMediaQuery("(min-height: 62.5rem)");
    const limit = isTallScreen
        ? QUERY_USER_SHARED_CHATS_DESKTOP_LIMIT
        : QUERY_USER_SHARED_CHATS_MOBILE_LIMIT;
    const queryClient = useQueryClient();

    function prefetchSharedChats() {
        queryClient.prefetchQuery({
            queryKey: [tag.userSharedChats(), 0, limit],
            queryFn: () =>
                getUserSharedChats({
                    offset: 0,
                    limit,
                }),
        });
    }

    return (
        <DialogTrigger
            dialogId="user-shared-chats-dialog"
            onMouseEnter={prefetchSharedChats}
            onFocus={prefetchSharedChats}
            {...props}
        />
    );
}

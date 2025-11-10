"use client";

import {
    IconDots,
    IconPencil,
    IconShare2,
    IconTrash,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
    ChatDeleteDialog,
    ChatDeleteDialogTrigger,
} from "@/features/chat/components/chat-delete-dialog";
import {
    ChatShareDialog,
    ChatShareDialogTrigger,
} from "@/features/chat/components/chat-share-dialog";
import type { UIChat } from "@/features/chat/lib/types";

import { cn } from "@/lib/utils";

type ChatItemDropdownMenuProps = {
    chat: UIChat;
    onRename?: () => void;
    showShare?: boolean;
    showDelete?: boolean;
    showRename?: boolean;
    contentProps?: Omit<
        React.ComponentProps<typeof DropdownMenuContent>,
        "children"
    >;
} & React.ComponentProps<typeof DropdownMenu>;

export function ChatItemDropdownMenu({
    contentProps,
    chat,
    children,
    showShare = true,
    showDelete = true,
    showRename = true,
    onRename,
    ...props
}: ChatItemDropdownMenuProps) {
    return (
        <ChatShareDialog chat={chat}>
            <ChatDeleteDialog chat={chat}>
                <DropdownMenu modal={false} {...props}>
                    {children}
                    <DropdownMenuContent
                        className="min-w-56"
                        onCloseAutoFocus={e => e.preventDefault()}
                        align="start"
                        {...contentProps}
                    >
                        {showRename && (
                            <DropdownMenuItem
                                onClick={() => {
                                    onRename?.();
                                }}
                            >
                                <IconPencil />
                                Rename
                            </DropdownMenuItem>
                        )}

                        {showShare && (
                            <ChatShareDialogTrigger asChild>
                                <DropdownMenuItem>
                                    <IconShare2 />
                                    Share
                                </DropdownMenuItem>
                            </ChatShareDialogTrigger>
                        )}

                        {showDelete && showShare && <DropdownMenuSeparator />}

                        {showDelete && (
                            <ChatDeleteDialogTrigger asChild>
                                <DropdownMenuItem variant="destructive">
                                    <IconTrash />
                                    Delete
                                </DropdownMenuItem>
                            </ChatDeleteDialogTrigger>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </ChatDeleteDialog>
        </ChatShareDialog>
    );
}

export function ChatItemDropdownMenuTrigger({
    children,
    className,
    ...props
}: React.ComponentProps<typeof DropdownMenuTrigger>) {
    return children ? (
        <DropdownMenuTrigger className={className} {...props}>
            {children}
        </DropdownMenuTrigger>
    ) : (
        <DropdownMenuTrigger asChild>
            <Button
                size="icon"
                variant="ghost"
                className={cn(
                    "pointer-coarse:opacity-100 size-8 bg-transparent opacity-0 transition-none duration-200 hover:bg-transparent focus-visible:opacity-100 group-hover/menu-button:opacity-100 group-focus-visible/menu-button:opacity-100 data-[state=open]:opacity-100",
                    className,
                )}
                {...props}
            >
                <IconDots className="pointer-coarse:text-zinc-400 text-zinc-200" />
                <span className="sr-only">Open menu</span>
            </Button>
        </DropdownMenuTrigger>
    );
}

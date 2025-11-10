import { useBatch } from "@/providers/batch-provider";
import { IconTrash } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";

import type { DBChatId } from "@/features/chat/lib/types";
import { useChatCacheSyncContext } from "@/features/chat/providers";

import { cn } from "@/lib/utils";

type UserSharedChatsTableDeleteButtonProps = {
    chatId: DBChatId;
} & React.ComponentProps<typeof Button>;

export function UserSharedChatsTableDeleteButton({
    chatId,
    variant = "ghost",
    size = "icon",
    children,
    className,
    onClick,
    ...props
}: UserSharedChatsTableDeleteButtonProps) {
    const batch = useBatch<DBChatId>();
    const chatCacheSync = useChatCacheSyncContext();

    function handleDelete() {
        chatCacheSync.removeFromSharedChats({ chatId, scope: "thisTab" });
        batch.addToBatch(chatId);
    }

    return (
        <Button
            variant={variant}
            size={size}
            className={cn(
                "size-8 !bg-transparent p-0 text-zinc-400 hover:text-zinc-50 focus-visible:text-zinc-50",
                className,
            )}
            onClick={e => {
                handleDelete();
                onClick?.(e);
            }}
            {...props}
        >
            {children ?? (
                <>
                    <span className="sr-only">Delete shared chat</span>
                    <IconTrash className="size-4" />
                </>
            )}
        </Button>
    );
}

import { IconDots, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useChatCacheSyncContext } from "@/features/chat/providers";
import { setAllUserChatsVisibility } from "@/features/chat/services/actions";

type UserSharedChatsTableDropdownMenuProps = {
    children: React.ReactNode;
} & React.ComponentProps<typeof DropdownMenu>;

export function UserSharedChatsTableDropdownMenu({
    children,
    ...props
}: UserSharedChatsTableDropdownMenuProps) {
    const chatCacheSync = useChatCacheSyncContext();

    async function handleDeleteAllSharedChats() {
        const revert = chatCacheSync.removeAllSharedChats({ scope: "thisTab" });
        const response = await setAllUserChatsVisibility({
            visibility: "private",
        });

        if (!response.success) {
            toast.error(response.message);
            revert();
            return;
        }

        chatCacheSync.invalidateSharedChats({ scope: "otherTabs" });
    }

    return (
        <DropdownMenu {...props}>
            {children}
            <DropdownMenuContent align="start">
                <DropdownMenuItem
                    variant="destructive"
                    onClick={handleDeleteAllSharedChats}
                >
                    <IconTrash className="size-4" />
                    Delete All Shared Chats
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function UserSharedChatsTableDropdownMenuTrigger({
    children,
    ...props
}: React.ComponentProps<typeof DropdownMenuTrigger>) {
    return children ? (
        <DropdownMenuTrigger {...props}>{children}</DropdownMenuTrigger>
    ) : (
        <DropdownMenuTrigger asChild>
            <Button
                variant="ghost"
                size="icon"
                className="size-8 !bg-transparent p-0 text-zinc-400 hover:text-zinc-50 focus-visible:text-zinc-50 data-[state=open]:text-zinc-50"
            >
                <span className="sr-only">Open menu</span>
                <IconDots className="size-4" />
            </Button>
        </DropdownMenuTrigger>
    );
}

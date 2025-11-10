"use client";

import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import type { UIChat } from "@/features/chat/lib/types";
import { useChatCacheSyncContext } from "@/features/chat/providers";
import { deleteUserChatById } from "@/features/chat/services/actions";

type ChatDeleteDialogProps = {
    chat: UIChat;
} & React.ComponentProps<typeof AlertDialog>;

export function ChatDeleteDialog({
    chat,
    children,
    ...props
}: ChatDeleteDialogProps) {
    const chatCacheSync = useChatCacheSyncContext();
    const router = useRouter();
    const params = useParams();

    async function handleDelete() {
        if (params.chatId === chat.id) {
            router.replace("/");
        }

        const revert = chatCacheSync.removeChat({ chatId: chat.id });
        const response = await deleteUserChatById({ chatId: chat.id });

        if (!response.success) {
            toast.error(response.message);
            revert();
        }

        chatCacheSync.invalidateInitialUserChatsSearch();
        chatCacheSync.invalidateSharedChats();
    }

    return (
        <AlertDialog {...props}>
            {children}
            <AlertDialogContent
                ref={el => el?.focus()}
                className="focus-visible:ring-0"
            >
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Chat</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action will remove: <strong>{chat.title}</strong>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        variant="destructive"
                        onMouseEnter={() => {
                            router.prefetch("/");
                        }}
                        onFocus={() => {
                            router.prefetch("/");
                        }}
                        onClick={handleDelete}
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export function ChatDeleteDialogTrigger(
    props: React.ComponentProps<typeof AlertDialogTrigger>,
) {
    return <AlertDialogTrigger {...props} />;
}

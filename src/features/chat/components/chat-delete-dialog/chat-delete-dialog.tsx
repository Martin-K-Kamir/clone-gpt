"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
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
import { getChatIdFromPathname } from "@/features/chat/lib/utils";
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
    const pathname = usePathname();
    const chatIdFromPathname = getChatIdFromPathname(pathname);

    async function handleDelete() {
        console.log("[handleDelete] chatIdFromPathname:", chatIdFromPathname);
        console.log("[handleDelete] params.chatId:", params.chatId);
        console.log("pathname:", pathname);
        if (chatIdFromPathname === chat.id || params.chatId === chat.id) {
            console.log("[handleDelete] redirecting to home");
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

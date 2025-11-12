import Link from "next/link";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { assertSessionExists } from "@/features/auth/lib/asserts";
import { auth } from "@/features/auth/services/auth";

import { DBChatId } from "@/features/chat/lib/types";
import { getUserChatById } from "@/features/chat/services/db";

import { cn } from "@/lib/utils";

import { ChatViewHeaderActions } from "./chat-view-header-actions";

type ChatViewHeaderProps = {
    chatId?: DBChatId;
} & Omit<React.ComponentProps<"header">, "children">;

export async function ChatViewHeader({
    chatId,
    className,
    ...props
}: ChatViewHeaderProps) {
    const session = await auth();
    assertSessionExists(session);
    const data = chatId
        ? await getUserChatById({ chatId, userId: session.user.id })
        : null;

    return (
        <header
            className={cn(
                "h-(--header-height) group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) flex shrink-0 items-center gap-2 border-b border-zinc-800 transition-[width,height] ease-linear",
                className,
            )}
            {...props}
        >
            <div className="flex w-full items-center gap-0.5 px-3 lg:gap-2 lg:px-5">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mx-1 sm:mx-2 data-[orientation=vertical]:h-4"
                />
                <h1 className="text-base font-medium ml-2.5">
                    <Link href="/">CloneGPT</Link>
                </h1>

                <ChatViewHeaderActions
                    className="ml-auto"
                    initialData={data}
                    userRole={session.user.role}
                />
            </div>
        </header>
    );
}

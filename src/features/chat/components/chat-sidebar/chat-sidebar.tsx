import { Suspense } from "react";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from "@/components/ui/sidebar";

import { ChatSidebarActions } from "@/features/chat/components/chat-sidebar-actions";
import {
    ChatSidebarHistory,
    ChatSidebarHistorySkeleton,
} from "@/features/chat/components/chat-sidebar-history";

import {
    UserSidebarItem,
    UserSidebarItemSkeleton,
} from "@/features/user/components/user-sidebar-item";

export async function ChatSidebar(props: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="offcanvas" variant="inset" {...props}>
            <SidebarHeader>
                <Suspense fallback={<UserSidebarItemSkeleton />}>
                    <UserSidebarItem />
                </Suspense>
                <ChatSidebarActions />
            </SidebarHeader>
            <SidebarContent>
                <Suspense fallback={<ChatSidebarHistorySkeleton />}>
                    <ChatSidebarHistory />
                </Suspense>
            </SidebarContent>
            <SidebarFooter className="h-4" />
        </Sidebar>
    );
}

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
} from "@/components/ui/sidebar";

import { ChatSidebarActionsSkeleton } from "@/features/chat/components/chat-sidebar-actions";
import { ChatSidebarHistorySkeleton } from "@/features/chat/components/chat-sidebar-history";

import { UserSidebarItemSkeleton } from "@/features/user/components/user-sidebar-item";

export function ChatSidebarSkeleton(
    props: React.ComponentProps<typeof Sidebar>,
) {
    return (
        <Sidebar collapsible="offcanvas" variant="inset" {...props}>
            <SidebarHeader>
                <UserSidebarItemSkeleton />
                <ChatSidebarActionsSkeleton />
            </SidebarHeader>
            <SidebarContent>
                <ChatSidebarHistorySkeleton />
            </SidebarContent>
            <SidebarFooter className="h-4" />
        </Sidebar>
    );
}

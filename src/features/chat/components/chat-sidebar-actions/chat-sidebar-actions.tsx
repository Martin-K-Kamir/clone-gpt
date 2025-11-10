import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
} from "@/components/ui/sidebar";

import { ChatSidebarNewChatButton } from "./chat-sidebar-new-chat-button";
import { ChatSidebarSearchChatsButton } from "./chat-sidebar-search-chats-button";

export function ChatSidebarActions() {
    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu className="gap-0">
                    <ChatSidebarNewChatButton />
                    <ChatSidebarSearchChatsButton />
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}

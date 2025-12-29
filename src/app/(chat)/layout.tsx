import { Suspense } from "react";

import {
    SidebarInset,
    SidebarProvider,
    SidebarWrapper,
} from "@/components/ui/sidebar";

import { ChatSearchDialog } from "@/features/chat/components/chat-search-dialog";
import {
    ChatSidebar,
    ChatSidebarSkeleton,
} from "@/features/chat/components/chat-sidebar";

export const preferredRegion = "fra1";

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <SidebarWrapper className="max-h-svh">
                <Suspense fallback={<ChatSidebarSkeleton />}>
                    <ChatSearchDialog>
                        <ChatSidebar />
                    </ChatSearchDialog>
                </Suspense>
                <SidebarInset>{children}</SidebarInset>
            </SidebarWrapper>
        </SidebarProvider>
    );
}

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
            <SidebarWrapper
                style={
                    {
                        "--sidebar-width": "calc(var(--spacing) * 72)",
                        "--header-height": "calc(var(--spacing) * 12)",
                    } as React.CSSProperties
                }
                className="max-h-svh"
            >
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

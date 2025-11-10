"use client";

import { IconSearch } from "@tabler/icons-react";

import { useDialogContext } from "@/components/ui/dialog";
import { KeyboardShortcut } from "@/components/ui/keyboard-shortcut";
import {
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";

import { ChatSearchDialogTrigger } from "@/features/chat/components/chat-search-dialog";

import type { OperatingSystem } from "@/lib/types";

const DEFAULT_SHORTCUTS = {
    macOS: "⌘ K",
    windows: "Ctrl+K",
};

export type ChatSidebarSearchChatsButtonProps = {
    label?: string;
    icon?: React.ReactNode;
    shortcuts?: Partial<Record<OperatingSystem, string>>;
    onShortcut?: () => void;
} & React.ComponentProps<typeof SidebarMenuButton>;

export function ChatSidebarSearchChatsButton({
    label = "Search",
    icon = <IconSearch />,
    shortcuts,
    onClick,
    onShortcut,
    ...props
}: ChatSidebarSearchChatsButtonProps) {
    const { onOpenChange } = useDialogContext();
    const { setOpenMobile, isMobile } = useSidebar();

    return (
        <ChatSearchDialogTrigger asChild>
            <SidebarMenuItem>
                <SidebarMenuButton
                    {...props}
                    onClick={e => {
                        onClick?.(e);
                        if (isMobile) {
                            setOpenMobile(false);
                        }
                    }}
                >
                    {icon}
                    <span>{label}</span>

                    <SidebarMenuBadge showOnHover>
                        <KeyboardShortcut
                            shortcuts={shortcuts ?? DEFAULT_SHORTCUTS}
                            onShortcut={() => {
                                onShortcut?.();
                                onOpenChange(true);
                            }}
                        />
                    </SidebarMenuBadge>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </ChatSearchDialogTrigger>
    );
}

export function ChatSidebarSearchChatsButtonSkeleton({
    label = "Search",
    icon = <IconSearch />,
    shortcuts,
    ...props
}: ChatSidebarSearchChatsButtonProps) {
    return (
        <SidebarMenuItem>
            <SidebarMenuButton {...props}>
                {icon}
                <span>{label}</span>

                <SidebarMenuBadge showOnHover>
                    <KeyboardShortcut
                        shortcuts={shortcuts ?? DEFAULT_SHORTCUTS}
                    />
                </SidebarMenuBadge>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

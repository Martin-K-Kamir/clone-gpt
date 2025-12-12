"use client";

import { IconEdit } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { KeyboardShortcut } from "@/components/ui/keyboard-shortcut";
import {
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebarContext,
} from "@/components/ui/sidebar";

import type { OperatingSystem } from "@/lib/types";

const DEFAULT_SHORTCUTS = {
    macOS: "⇧ ⌘ O",
    windows: "Ctrl+Shift+O",
};

type ChatSidebarNewChatButtonProps = {
    label?: string;
    icon?: React.ReactNode;
    href?: string;
    shortcuts?: Partial<Record<OperatingSystem, string>>;
} & React.ComponentProps<typeof SidebarMenuItem>;

export function ChatSidebarNewChatButton({
    label = "New Chat",
    icon = <IconEdit />,
    href = "/",
    shortcuts,
    ...props
}: ChatSidebarNewChatButtonProps) {
    const router = useRouter();
    const { setOpenMobile, isMobile } = useSidebarContext();

    return (
        <SidebarMenuItem {...props}>
            <SidebarMenuButton asChild>
                <Link
                    href={href}
                    onClick={() => {
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
                                if (window.location.pathname !== href) {
                                    router.push(href);
                                }
                            }}
                        />
                    </SidebarMenuBadge>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    );
}

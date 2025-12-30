import {
    CalendarIcon,
    HomeIcon,
    InboxIcon,
    SearchIcon,
    SettingsIcon,
} from "lucide-react";

export interface SidebarMenuItem {
    title: string;
    icon: typeof HomeIcon;
}

export const MOCK_SIDEBAR_MENU_ITEMS: SidebarMenuItem[] = [
    { title: "Home", icon: HomeIcon },
    { title: "Inbox", icon: InboxIcon },
    { title: "Calendar", icon: CalendarIcon },
    { title: "Search", icon: SearchIcon },
    { title: "Settings", icon: SettingsIcon },
];

export const MOCK_SIDEBAR_RECENT_CHATS = [
    "React hooks explained",
    "TypeScript generics",
    "CSS Grid layout",
    "Next.js routing",
];

export const MOCK_SIDEBAR_USER_NAME = "John Doe";

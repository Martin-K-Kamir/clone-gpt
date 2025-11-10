import { SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";

import { cn } from "@/lib/utils";

type ChatSidebarHistoryErrorProps = {
    classNameError?: string;
    errorMessage?: string;
} & Omit<React.ComponentProps<typeof SidebarGroup>, "children">;

export function ChatSidebarHistoryError({
    errorMessage = "An error occurred while fetching your chats. Please try again later.",
    classNameError,
    ...props
}: ChatSidebarHistoryErrorProps) {
    return (
        <SidebarGroup {...props}>
            <SidebarGroupLabel>Chats</SidebarGroupLabel>
            <p
                className={cn(
                    "text-balance p-2.5 text-sm font-medium text-rose-400",
                    classNameError,
                )}
            >
                {errorMessage}
            </p>
        </SidebarGroup>
    );
}

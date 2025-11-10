import { SidebarGroup } from "@/components/ui/sidebar";

export function ChatSidebarHistoryEmpty({
    ...props
}: Omit<React.ComponentProps<typeof SidebarGroup>, "children">) {
    return (
        <SidebarGroup {...props}>
            <div className="flex flex-col items-start gap-2 p-2">
                <p className="text-zinc- text-balance text-left text-sm font-medium leading-relaxed text-zinc-100">
                    You have no chats yet.
                    <br />
                    Start a new chat to see it here.
                </p>
            </div>
        </SidebarGroup>
    );
}

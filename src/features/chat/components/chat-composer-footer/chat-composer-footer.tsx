import { cn } from "@/lib/utils";

import { ChatComposerPublicNotice } from "./chat-composer-public-notice";

export function ChatComposerFooter({
    className,
    ...props
}: Omit<React.ComponentProps<"div">, "children">) {
    return (
        <div
            className={cn(
                "bg-red-925 absolute bottom-0 z-10 flex h-12 w-full items-center justify-center text-center",
                className,
            )}
            data-testid="chat-composer-footer"
            data-slot="chat-composer-footer"
            {...props}
        >
            <ChatComposerPublicNotice />
        </div>
    );
}

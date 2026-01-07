import { IconAlertSquareRounded } from "@tabler/icons-react";
import type { ChatStatus } from "ai";

import { RateLimitError } from "@/lib/classes";
import { cn } from "@/lib/utils";

type ChatMessagesErrorProps = {
    status: ChatStatus;
    title?: string;
    description?: string;
    error?: Error;
    classNameContent?: string;
    classNameIcon?: string;
} & Omit<React.ComponentProps<"div">, "children">;

export function ChatMessagesError({
    title = "Something went wrong. Please try again.",
    className,
    classNameContent,
    classNameIcon,
    status,
    error,
    ...props
}: ChatMessagesErrorProps) {
    const hasErrorStatus = status === "error";
    const ignoredErrorNames = [RateLimitError.name];
    const shouldIgnoreError = error && ignoredErrorNames.includes(error.name);

    if (!error || !hasErrorStatus || shouldIgnoreError) {
        return null;
    }

    return (
        <div className={cn("min-h-96 pb-24", className)} {...props}>
            <p
                className={cn(
                    "max-w-2/3 w-fit items-center gap-2 self-end rounded-2xl bg-rose-900 px-4 py-2.5 text-rose-50 sm:text-base",
                    classNameContent,
                )}
            >
                <span className="flex items-center gap-3 sm:gap-2">
                    <IconAlertSquareRounded
                        className={cn("size-5 shrink-0", classNameIcon)}
                    />
                    {title}
                </span>
                {/* {error?.message && (
                    <span className="mt-2 text-pretty text-sm text-rose-50">
                        Reason: {error.message}
                    </span>
                )} */}
            </p>
        </div>
    );
}

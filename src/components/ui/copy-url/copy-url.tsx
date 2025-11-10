import { IconCopy } from "@tabler/icons-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

import { useCopyToClipboard } from "@/hooks";

type CopyUrlProps = {
    url: string;
    buttonProps?: Omit<React.ComponentProps<typeof Button>, "children">;
    inputProps?: Omit<React.ComponentProps<"input">, "value">;
} & Omit<React.ComponentProps<"div">, "children">;

export function CopyUrl({
    url,
    className,
    buttonProps,
    inputProps,
    ...props
}: CopyUrlProps) {
    const { copied, copy } = useCopyToClipboard({
        onError: message => {
            toast.error(message);
        },
    });

    return (
        <div
            className={cn(
                "flex items-center gap-4 rounded-xl border border-zinc-700 py-2 pl-3 pr-2",
                className,
            )}
            {...props}
        >
            <input
                type="text"
                value={url}
                className={cn(
                    "w-full select-all bg-transparent text-sm text-zinc-50 outline-none",
                    inputProps?.className,
                )}
                {...inputProps}
                readOnly
            />
            <Button
                size="sm"
                {...buttonProps}
                onClick={() => copy(url)}
                disabled={copied}
            >
                <IconCopy />
                {copied ? "Copied" : "Copy Link"}
            </Button>
        </div>
    );
}

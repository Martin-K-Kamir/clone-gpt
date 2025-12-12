import { cn } from "@/lib/utils";
import { isSupabaseStorageUrl } from "@/lib/utils/is-supabase-storage-url";
import { parseStorageFileUrl } from "@/lib/utils/parse-storage-file-url";

export function MarkdownLink({
    href,
    children,
    className,
    ...props
}: React.ComponentProps<"a">) {
    const canDownload = isSupabaseStorageUrl(href);

    if (canDownload) {
        const result = parseStorageFileUrl(href);

        if (!result) {
            return null;
        }

        const { filename, extension } = result;

        return (
            <a
                className={cn("text-zinc-50", className)}
                href={`${href}?download=${filename}.${extension}`}
                download={`${filename}.${extension}`}
                {...props}
            >
                {children}
            </a>
        );
    }

    return (
        <a
            className={cn("text-zinc-50", className)}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            {...props}
        >
            {children}
        </a>
    );
}

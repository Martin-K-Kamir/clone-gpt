import { cn } from "@/lib/utils";

import { SourceListItemSkeleton } from "./source-list-item-skeleton";

type SourceListSkeletonProps = {
    classNameItemSkeleton?: string;
    length?: number;
} & React.ComponentProps<"ul">;

export function SourceListSkeleton({
    className,
    classNameItemSkeleton,
    length = 4,
    ...props
}: SourceListSkeletonProps) {
    return (
        <ul
            className={cn("flex flex-col divide-y divide-zinc-700", className)}
            {...props}
        >
            {Array.from({ length }).map((_, index) => (
                <li key={index}>
                    <SourceListItemSkeleton className={classNameItemSkeleton} />
                </li>
            ))}
        </ul>
    );
}

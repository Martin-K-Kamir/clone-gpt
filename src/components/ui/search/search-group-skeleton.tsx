import { Command as CommandPrimitive } from "cmdk";

import { SearchItemSkeleton } from "./search-item-skeleton";

type SearchGroupSkeletonProps = {
    length?: number;
    showSkeletonIcon?: boolean;
    lengthSkeleton?: number;
    classNameSkeleton?: string;
} & React.ComponentProps<typeof CommandPrimitive.List>;

export function SearchGroupSkeleton({
    showSkeletonIcon,
    lengthSkeleton,
    classNameSkeleton,
    length = 4,
    ...props
}: SearchGroupSkeletonProps) {
    return (
        <CommandPrimitive.Group data-slot="search-group-skeleton" {...props}>
            {Array.from({ length }).map((_, index) => (
                <SearchItemSkeleton
                    key={index}
                    showIcon={showSkeletonIcon}
                    length={lengthSkeleton}
                    classNameSkeleton={classNameSkeleton}
                />
            ))}
        </CommandPrimitive.Group>
    );
}

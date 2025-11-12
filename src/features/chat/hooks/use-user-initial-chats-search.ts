import { useQuery } from "@tanstack/react-query";

import type { UIChat } from "@/features/chat/lib/types";
import { getUserChatsByDate } from "@/features/chat/services/api";

import { tag } from "@/lib/cache-tags";
import type { OrderBy } from "@/lib/types";
import { groupByTimePastPeriods } from "@/lib/utils";

export type UseUserInitialChatsSearchOptions = Partial<{
    initialData: UIChat[];
    from: Date;
    limit: number;
    orderBy: OrderBy;
}>;

export function useUserInitialChatsSearch(
    options?: UseUserInitialChatsSearchOptions,
) {
    const { initialData, from, limit, orderBy } = options || {};

    return useQuery({
        queryKey: [tag.userInitialChatsSearch()],
        queryFn: () =>
            getUserChatsByDate({
                from,
                limit,
                orderBy,
            }),
        select: data => {
            const results = data.map(chat => ({
                ...chat,
                href: `/chat/${chat.id}`,
            }));

            const sortedResults = results.sort((a, b) => {
                return (
                    new Date(b.updatedAt).getTime() -
                    new Date(a.updatedAt).getTime()
                );
            });

            const seenChatIds = new Set<UIChat["id"]>();

            const dedupedResults = sortedResults.filter(chat => {
                if (seenChatIds.has(chat.id)) {
                    return false;
                }
                seenChatIds.add(chat.id);
                return true;
            });

            return groupByTimePastPeriods(
                dedupedResults,
                chat => chat.updatedAt,
            );
        },
        initialData,
    });
}

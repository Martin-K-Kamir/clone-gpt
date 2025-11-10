"use client";

import { IconAlertSquareRounded } from "@tabler/icons-react";
import { sub } from "date-fns";
import { createContext, useContext, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    SearchDialog,
    SearchDialogContent,
    SearchEmpty,
    SearchError,
    SearchGroupSkeleton,
    SearchInput,
    SearchList,
    SearchResultsList,
} from "@/components/ui/search";

import {
    useInfiniteSearchUserChats,
    useUserInitialChatsSearch,
} from "@/features/chat/hooks";
import { QUERY_SEARCH_USER_CHATS_LIMIT } from "@/features/chat/lib/constants";
import type { UIChat } from "@/features/chat/lib/types";

import { ORDER_BY } from "@/lib/constants";

import { useDialogState } from "@/hooks/use-dialog-state";

const ChatSearchDialogContext = createContext<{
    open: boolean | undefined;
    setOpen: (open: boolean) => void;
} | null>(null);

export function useChatSearchDialogContext() {
    const context = useContext(ChatSearchDialogContext);
    if (!context) {
        throw new Error(
            "useChatSearchDialogContext must be used within a ChatSearchDialogContext",
        );
    }
    return context;
}

type ChatSearchDialogClientProps = {
    initialData?: UIChat[];
} & React.ComponentProps<typeof SearchDialog>;

export function ChatSearchDialogClient({
    initialData,
    children,
    ...props
}: ChatSearchDialogClientProps) {
    const ref = useRef<HTMLDivElement | null>(null);
    const [query, setQuery] = useState("");
    const [open, setOpen] = useDialogState({
        open: props.open,
        defaultOpen: props.defaultOpen,
        onOpenChange: props.onOpenChange,
    });

    const {
        error,
        searchResults,
        hasNextPage,
        hasResults,
        isEmpty,
        isError,
        isSearching,
    } = useInfiniteSearchUserChats(query, ref, {
        limit: QUERY_SEARCH_USER_CHATS_LIMIT,
    });

    const { data: initialChatsSearch } = useUserInitialChatsSearch({
        initialData,
        from: sub(new Date(), { days: 30 }),
        limit: QUERY_SEARCH_USER_CHATS_LIMIT,
        orderBy: ORDER_BY.UPDATED_AT,
    });

    const value = useMemo(() => ({ open, setOpen }), [open, setOpen]);

    return (
        <ChatSearchDialogContext value={value}>
            <SearchDialog
                fullscreen="lg"
                dialogId="chat-search-dialog"
                open={open}
                onOpenChange={setOpen}
                {...props}
            >
                {children}

                <SearchDialogContent className="!p-0">
                    <SearchInput
                        showCloseButton
                        placeholder="Search chats..."
                        value={query}
                        onValueChange={setQuery}
                    />

                    <SearchList>
                        {initialChatsSearch && !query && (
                            <SearchResultsList data={initialChatsSearch} />
                        )}

                        {hasResults && (
                            <SearchResultsList
                                data={searchResults}
                                nearEndRef={ref}
                                query={query}
                            />
                        )}

                        {hasResults && hasNextPage && (
                            <SearchGroupSkeleton length={3} />
                        )}

                        {isSearching && !hasResults && <SearchGroupSkeleton />}

                        {isEmpty && <SearchEmpty>No chats found</SearchEmpty>}

                        {isError && error && (
                            <SearchError>
                                <IconAlertSquareRounded />
                                {error.message}
                            </SearchError>
                        )}
                    </SearchList>
                </SearchDialogContent>
            </SearchDialog>
        </ChatSearchDialogContext>
    );
}

export function ChatSearchDialogTrigger({
    onClick,
    ...props
}: React.ComponentProps<typeof Button>) {
    const { setOpen } = useChatSearchDialogContext();

    return (
        <Button
            {...props}
            onClick={e => {
                onClick?.(e);
                setOpen(true);
            }}
            styled={false}
        />
    );
}

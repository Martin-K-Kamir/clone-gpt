"use client";

import { BatchProvider } from "@/providers/batch-provider";
import { useMediaQuery } from "usehooks-ts";

import {
    DataTable,
    DataTableContent,
    DataTablePagination,
} from "@/components/ui/data-table";

import {
    useBatchUserSharedChats,
    useUserSharedChats,
} from "@/features/chat/hooks";
import {
    QUERY_USER_SHARED_CHATS_DESKTOP_LIMIT,
    QUERY_USER_SHARED_CHATS_MOBILE_LIMIT,
} from "@/features/chat/lib/constants";
import { DBChatId } from "@/features/chat/lib/types";

import { cn } from "@/lib/utils";

import { columns } from "./user-shared-chats-table-columns";

export function UserSharedChatsTable() {
    const isTallScreen = useMediaQuery("(min-height: 62.5rem)");
    const limit = isTallScreen
        ? QUERY_USER_SHARED_CHATS_DESKTOP_LIMIT
        : QUERY_USER_SHARED_CHATS_MOBILE_LIMIT;

    const {
        data,
        isPending,
        error,
        onNextPage,
        onPrevPage,
        onFirstPage,
        onLastPage,
    } = useUserSharedChats({
        limit,
    });

    const { batchOperation, handleBatchSuccess, handleBatchError } =
        useBatchUserSharedChats("private");

    return (
        <BatchProvider
            operation={(chatIds: DBChatId[]) => batchOperation(data, chatIds)}
            onSuccess={handleBatchSuccess}
            onError={handleBatchError}
            debounceMs={250}
        >
            <DataTable
                columns={columns}
                data={data?.data ?? []}
                isLoading={isPending}
                error={error}
                options={{
                    pageSize: limit,
                    totalCount: data?.totalCount ?? 0,
                    manualPagination: true,
                }}
            >
                <DataTableContent
                    classNameWrapper={cn(
                        isTallScreen ? "h-[47.5rem]" : "h-[25.5rem]",
                    )}
                    noResultsMessage="You don't have any shared chats."
                />

                <DataTablePagination
                    className="mt-4"
                    showSelector={false}
                    onNextPage={onNextPage}
                    onPrevPage={onPrevPage}
                    onFirstPage={onFirstPage}
                    onLastPage={onLastPage}
                />
            </DataTable>
        </BatchProvider>
    );
}

"use client";

import { IconLink } from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Link from "next/link";

import { Skeleton } from "@/components/ui/skeleton";

import type { DBChat, DBChatId } from "@/features/chat/lib/types";

import { generateSizePercentage } from "@/lib/utils";

import { UserSharedChatsTableDeleteButton } from "./user-shared-chats-table-delete-button";
import {
    UserSharedChatsTableDropdownMenu,
    UserSharedChatsTableDropdownMenuTrigger,
} from "./user-shared-chats-table-dropdown-menu";

export const columns: ColumnDef<DBChat>[] = [
    {
        id: "title",
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => {
            return (
                <Link
                    href={`/chat/${row.original.id}`}
                    className="rounded-xs flex min-w-0 items-center gap-1.5 text-blue-500 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500"
                    target="_blank"
                >
                    <IconLink className="size-4 shrink-0" />
                    <span className="min-w-0 truncate">
                        {row.original.title}
                    </span>
                </Link>
            );
        },
        meta: {
            className: "max-w-0 min-w-0 overflow-hidden",
            skeleton: (rowIndex, columnIndex) => (
                <Skeleton
                    className="h-5 bg-zinc-400/20"
                    style={{
                        width: generateSizePercentage(
                            rowIndex + (columnIndex ?? 0),
                            45,
                            55,
                        ),
                    }}
                />
            ),
        },
    },
    {
        id: "visibleAt",
        accessorKey: "visibleAt",
        header: "Date",
        cell: ({ row }) => format(row.original.visibleAt, "MMM d, yyyy"),
        meta: {
            className: "w-28 sm:w-44",
            skeleton: (rowIndex, columnIndex) => (
                <Skeleton
                    className="h-5 bg-zinc-400/20"
                    style={{
                        width: generateSizePercentage(
                            rowIndex + (columnIndex ?? 0),
                            65,
                            75,
                        ),
                    }}
                />
            ),
        },
    },
    {
        id: "actions",
        header: () => (
            <UserSharedChatsTableDropdownMenu>
                <UserSharedChatsTableDropdownMenuTrigger />
            </UserSharedChatsTableDropdownMenu>
        ),
        cell: ({ row }) => (
            <UserSharedChatsTableDeleteButton chatId={row.original.id} />
        ),
        meta: {
            className: "w-10 p-0",
            skeleton: () => (
                <UserSharedChatsTableDeleteButton
                    disabled
                    chatId={"" as DBChatId}
                />
            ),
        },
    },
];

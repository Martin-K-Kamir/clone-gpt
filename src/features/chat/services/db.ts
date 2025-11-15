"use server";

import { unstable_cacheTag as cacheTag, revalidateTag } from "next/cache";

import {
    assertIsChatTitle,
    assertIsChatVisibility,
    assertIsDBChatId,
    assertIsDBChatIds,
    assertIsDBChatMessageId,
    assertIsDownvote,
    assertIsPartialChatDataValid,
    assertIsUpvote,
} from "@/features/chat/lib/asserts";
import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import type {
    DBChat,
    DBChatId,
    DBChatMessageRole,
    DBChatSearchResult,
    UIChatMessage,
    WithChatId,
    WithChatMessageId,
    WithDownvote,
    WithIsOwner,
    WithMessage,
    WithMessages,
    WithNewChatId,
    WithOptionalVerifyChatAccess,
    WithUpvote,
    WithVisibility,
} from "@/features/chat/lib/types";
import { duplicateMessages } from "@/features/chat/lib/utils";

import { assertIsDBUserId } from "@/features/user/lib/asserts";
import type { WithUserId } from "@/features/user/lib/types";

import {
    assertIsDate,
    assertIsDateCursor,
    assertIsNonEmptyString,
    assertIsNumber,
} from "@/lib/asserts";
import { tag } from "@/lib/cache-tags";
import { ORDER_BY } from "@/lib/constants";
import type {
    DateCursor,
    Json,
    PaginatedData,
    WithOptionalCursor,
    WithOptionalFrom,
    WithOptionalLimit,
    WithOptionalOffset,
    WithOptionalOrderBy,
    WithOptionalThrowOnNotFound,
    WithOptionalTo,
    WithQuery,
    WithTitle,
} from "@/lib/types";
import { extractQuerySnippet, toISOString } from "@/lib/utils";

import { supabase } from "@/services/supabase";

export async function createUserChat({
    chatId,
    userId,
    title,
    throwOnNotFound = true,
}: WithTitle & WithChatId & WithUserId & WithOptionalThrowOnNotFound) {
    assertIsDBChatId(chatId);
    assertIsDBUserId(userId);
    assertIsChatTitle(title);

    const { data, error } = await supabase
        .from("chats")
        .insert({
            title,
            userId,
            id: chatId,
            updatedAt: new Date().toISOString(),
        })
        .select("*")
        .single();

    if (error) throw new Error("Chat insert failed");
    if (!data && throwOnNotFound) throw new Error("Chat not found");
    if (!data) return null;

    revalidateTag(tag.userChats(userId));
    revalidateTag(tag.userChat(chatId));

    return data as DBChat;
}

export async function duplicateUserChat({
    newChatId,
    chatId,
    userId,
    throwOnNotFound = true,
}: WithNewChatId & WithChatId & WithUserId & WithOptionalThrowOnNotFound) {
    assertIsDBChatId(chatId);
    assertIsDBChatId(newChatId);
    assertIsDBUserId(userId);

    const originalChat = await getUserChatById({
        chatId,
        userId,
        throwOnNotFound,
        verifyChatAccess: false,
    });

    if (!originalChat) return null;

    const { data: originalMessages } = await uncachedGetUserChatMessages({
        chatId,
        userId,
        verifyChatAccess: false,
    });

    const newChat = await createUserChat({
        userId,
        throwOnNotFound,
        title: originalChat.title,
        chatId: newChatId,
    });

    if (originalMessages?.length) {
        const duplicatedMessages = await duplicateMessages({
            userId,
            newChatId,
            messages: originalMessages,
        });

        await storeUserChatMessages({
            userId,
            chatId: newChatId,
            messages: duplicatedMessages,
        });
    }

    revalidateTag(tag.userChats(userId));
    revalidateTag(tag.userChatsSearch(userId));
    revalidateTag(tag.userInitialChatsSearch(userId));

    return newChat as DBChat;
}

export async function getUserChats({
    userId,
    offset = 0,
    limit = Number.MAX_SAFE_INTEGER,
    orderBy = ORDER_BY.CREATED_AT,
}: WithOptionalOffset &
    WithOptionalLimit &
    WithOptionalOrderBy &
    WithUserId): Promise<PaginatedData<DBChat[]>> {
    "use cache";

    assertIsDBUserId(userId);
    assertIsNumber(offset);
    assertIsNumber(limit);
    cacheTag(tag.userChats(userId));

    const from = offset;
    const to = offset + limit - 1;

    const { data, error, count } = await supabase
        .from("chats")
        .select("*", { count: "exact" })
        .eq("userId", userId)
        .order(orderBy, { ascending: false })
        .range(from, to);

    if (error) throw new Error("Failed to fetch user chats");

    const totalCount = count ?? 0;
    const hasNextPage = to + 1 < totalCount;
    const nextOffset = hasNextPage ? to + 1 : undefined;

    return {
        data: data.map(chat => ({
            ...chat,
            isOwner: chat.userId === userId,
        })) as (DBChat & WithIsOwner)[],
        totalCount,
        hasNextPage,
        nextOffset,
    };
}

export async function updateUserChat({
    chatId,
    userId,
    data,
}: {
    data: Partial<DBChat>;
} & WithChatId &
    WithUserId) {
    assertIsDBChatId(chatId);
    assertIsDBUserId(userId);
    assertIsPartialChatDataValid(data);

    const { data: updatedData, error } = await supabase
        .from("chats")
        .update(data)
        .eq("id", chatId)
        .eq("userId", userId)
        .select("*")
        .single();

    if (error) throw new Error("Chat update failed");

    revalidateTag(tag.userChats(userId));

    console.log("[chat db] updated user chat:", updatedData);
    return updatedData as DBChat;
}

export async function getUserChatsByDate({
    userId,
    from,
    to = new Date(),
    limit = Number.MAX_SAFE_INTEGER,
    orderBy = ORDER_BY.CREATED_AT,
}: WithOptionalLimit &
    WithOptionalFrom &
    WithOptionalTo &
    WithOptionalOrderBy &
    WithUserId): Promise<DBChat[]> {
    "use cache";
    assertIsDBUserId(userId);
    assertIsNumber(limit);
    if (from) assertIsDate(from);
    if (to) assertIsDate(to);

    const fromISOString = from ? toISOString(from) : toISOString(new Date(0));
    const toISOStringValue = toISOString(to);

    cacheTag(tag.userChats(userId));

    const query = supabase
        .from("chats")
        .select("*")
        .eq("userId", userId)
        .order(orderBy, { ascending: false })
        .limit(limit)
        .gte(orderBy, fromISOString)
        .lte(orderBy, toISOStringValue);

    const { data, error } = await query;

    if (error) {
        throw new Error(`Failed to fetch chats by date: ${error.message}`);
    }

    return data as DBChat[];
}

export async function getUserChatById({
    chatId,
    userId,
    verifyChatAccess = true,
    throwOnNotFound = true,
}: WithOptionalVerifyChatAccess &
    WithChatId &
    WithUserId &
    WithOptionalThrowOnNotFound) {
    "use cache";
    assertIsDBChatId(chatId);
    assertIsDBUserId(userId);
    cacheTag(tag.userChat(chatId));

    const chatAccess = verifyChatAccess
        ? await getChatAccess({ chatId, userId })
        : undefined;

    if (verifyChatAccess && !chatAccess?.allowed) {
        throw new Error(
            "The chat is not accessible. It may be private or no longer exists.",
        );
    }

    const { data, error } = await supabase
        .from("chats")
        .select("*")
        .eq("id", chatId)
        .maybeSingle();

    if (error) throw new Error("Failed to fetch user chat");
    if (!data && throwOnNotFound) throw new Error("Chat not found");
    if (!data) return null;

    return {
        ...data,
        isOwner: data.userId === userId,
    } as DBChat & WithIsOwner;
}

export async function getChatAccess({
    chatId,
    userId,
}: WithChatId & WithUserId) {
    "use cache";
    assertIsDBChatId(chatId);
    assertIsDBUserId(userId);
    cacheTag(tag.chatVisibility(chatId));

    const { data: chat } = await supabase
        .from("chats")
        .select("id, visibility, userId")
        .eq("id", chatId)
        .or(`visibility.eq.public,visibility.eq.private`)
        .maybeSingle();

    const chatFound = !!chat;

    if (!chatFound) {
        return {
            allowed: false,
            chatFound: false,
            isOwner: false,
            isPrivate: false,
            isPublic: false,
        };
    }

    const isOwner = chat.userId === userId;
    const isPrivate = chat.visibility === CHAT_VISIBILITY.PRIVATE;
    const isPublic = chat.visibility === CHAT_VISIBILITY.PUBLIC;

    if (isOwner) {
        return {
            allowed: true,
            visibility: chat.visibility,
            chatFound,
            isOwner,
            isPrivate,
            isPublic,
        };
    }

    if (isPrivate && !isOwner) {
        return {
            allowed: false,
            visibility: chat.visibility,
            chatFound,
            isOwner,
            isPrivate,
            isPublic,
        };
    }

    if (isPublic && !isOwner) {
        return {
            allowed: true,
            visibility: chat.visibility,
            chatFound,
            isOwner,
            isPrivate,
            isPublic,
        };
    }

    throw new Error("Invalid chat visibility state");
}

export async function getUserChatMessages({
    chatId,
    userId,
    verifyChatAccess = true,
}: WithOptionalVerifyChatAccess & WithChatId & WithUserId) {
    "use cache";
    cacheTag(tag.chatMessages(chatId));
    return uncachedGetUserChatMessages({
        chatId,
        userId,
        verifyChatAccess,
    });
}

export async function uncachedGetUserChatMessages({
    chatId,
    userId,
    verifyChatAccess = true,
}: WithOptionalVerifyChatAccess & WithChatId & WithUserId) {
    assertIsDBChatId(chatId);
    assertIsDBUserId(userId);

    const chatAccess = verifyChatAccess
        ? await getChatAccess({ chatId, userId })
        : undefined;

    if (verifyChatAccess && !chatAccess?.allowed) {
        throw new Error(
            "The chat is not accessible. It may be private or no longer exists.",
        );
    }

    const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("chatId", chatId)
        .order("createdAt", { ascending: true });

    if (error) throw new Error("Failed to fetch chat messages");

    const messages = data ?? [];

    if (chatAccess?.isOwner === false) {
        return {
            data: messages.map(message => ({
                ...message,
                metadata: {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ...(message.metadata as any),
                    isUpvoted: false,
                    isDownvoted: false,
                },
            })) as unknown as UIChatMessage[],
            visibility: chatAccess?.visibility,
            isOwner: chatAccess?.isOwner,
        };
    }

    return {
        data: messages as unknown as UIChatMessage[],
        visibility: chatAccess?.visibility,
        isOwner: chatAccess?.isOwner,
    };
}

export async function storeUserChatMessage({
    message,
    chatId,
    userId,
}: WithMessage & WithChatId & WithUserId) {
    assertIsDBChatId(chatId);
    assertIsDBUserId(userId);

    const { error } = await supabase.from("messages").insert({
        chatId,
        userId,
        id: message.id,
        createdAt: message.metadata?.createdAt ?? new Date().toISOString(),
        role: message.role as DBChatMessageRole,
        metadata: message.metadata as Json,
        parts: message.parts as Json[],
        content: message.parts
            .filter(part => part.type === "text")
            .map(part => part.text)
            .join(""),
    });

    if (error) throw new Error("Failed to store chat message");

    revalidateTag(tag.chatMessages(chatId));
    revalidateTag(tag.userChat(chatId));
    revalidateTag(tag.userChatsSearch(userId));
    console.log("[chat db] stored user chat message:", message);
}

export async function storeUserChatMessages({
    messages,
    chatId,
    userId,
}: WithMessages & WithChatId & WithUserId) {
    assertIsDBChatId(chatId);
    assertIsDBUserId(userId);

    const { error } = await supabase.from("messages").insert(
        messages.map(message => ({
            chatId,
            userId,
            id: message.id,
            role: message.role as DBChatMessageRole,
            metadata: message.metadata as Json,
            parts: message.parts as Json[],
            content: message.parts
                .filter(part => part.type === "text")
                .map(part => part.text)
                .join(""),
        })),
    );

    if (error) throw new Error("Failed to store chat message");

    revalidateTag(tag.chatMessages(chatId));
    revalidateTag(tag.userChat(chatId));
    revalidateTag(tag.userChatsSearch(userId));
    console.log("[chat db] stored user chat messages:", messages);
}

export async function storeUserAndResponseChatMessages({
    userMessage,
    responseMessage,
    chatId,
    userId,
}: WithChatId &
    WithUserId & {
        userMessage: UIChatMessage;
        responseMessage: UIChatMessage;
    }) {
    assertIsDBChatId(chatId);
    assertIsDBUserId(userId);

    const { error: userMessageError } = await supabase.from("messages").insert({
        chatId,
        userId,
        id: userMessage.id,
        role: userMessage.role as DBChatMessageRole,
        metadata: userMessage.metadata as Json,
        parts: userMessage.parts as Json[],
        content: userMessage.parts
            .filter(part => part.type === "text")
            .map(part => part.text)
            .join(""),
    });

    if (userMessageError) throw new Error("Failed to store user chat message");

    const { error: responseMessageError } = await supabase
        .from("messages")
        .insert({
            chatId,
            userId,
            id: responseMessage.id,
            role: responseMessage.role as DBChatMessageRole,
            metadata: responseMessage.metadata as Json,
            parts: responseMessage.parts as Json[],
            content: responseMessage.parts
                .filter(part => part.type === "text")
                .map(part => part.text)
                .join(""),
        });

    if (responseMessageError)
        throw new Error("Failed to store response chat message");

    revalidateTag(tag.chatMessages(chatId));
    revalidateTag(tag.userChat(chatId));
    revalidateTag(tag.userChatsSearch(userId));
    console.log("[chat db] stored user and assistant chat messages:", {
        userMessage,
        responseMessage,
    });
}

export async function updateUserChatMessage({
    message,
    chatId,
    userId,
}: WithMessage & WithChatId & WithUserId) {
    assertIsDBChatId(chatId);
    assertIsDBUserId(userId);

    const { error } = await supabase
        .from("messages")
        .update({
            parts: message.parts as Json[],
            content: message.parts
                .filter(part => part.type === "text")
                .map(part => part.text)
                .join(""),
        })
        .eq("id", message.id)
        .eq("chatId", chatId)
        .eq("userId", userId);

    if (error) throw new Error("Failed to update chat message");

    revalidateTag(tag.chatMessages(chatId));
    revalidateTag(tag.userChat(chatId));
    revalidateTag(tag.userChatsSearch(userId));
    console.log("[chat db] updated user chat message:", message);
}

export async function deleteUserChatMessagesFromMessage({
    messageId,
    chatId,
    userId,
}: WithChatMessageId & WithChatId & WithUserId) {
    assertIsDBChatMessageId(messageId);
    assertIsDBChatId(chatId);
    assertIsDBUserId(userId);

    const { data: targetMessage } = await supabase
        .from("messages")
        .select("createdAt")
        .eq("id", messageId)
        .eq("chatId", chatId)
        .single();

    if (!targetMessage) {
        throw new Error("Target message not found");
    }

    const { error } = await supabase
        .from("messages")
        .delete()
        .eq("chatId", chatId)
        .gte("createdAt", targetMessage.createdAt);

    if (error) throw new Error("Failed to delete chat messages");

    revalidateTag(tag.chatMessages(chatId));
    revalidateTag(tag.userChat(chatId));
    revalidateTag(tag.userChatsSearch(userId));
    console.log(
        "[chat db] deleted user chat messages from message:",
        messageId,
    );
}

export async function deleteAllUserChats({ userId }: WithUserId) {
    assertIsDBUserId(userId);

    const { error: messageError } = await supabase
        .from("messages")
        .delete()
        .eq("userId", userId);

    if (messageError) throw new Error("Failed to delete all user messages");

    const { error } = await supabase
        .from("chats")
        .delete()
        .eq("userId", userId);

    if (error) throw new Error("Failed to delete all user chats");

    revalidateTag(tag.userChats(userId));
    revalidateTag(tag.userSharedChats(userId));
    revalidateTag(tag.userChatsSearch(userId));
}

export async function deleteUserChatById({
    chatId,
    userId,
}: WithChatId & WithUserId) {
    assertIsDBChatId(chatId);
    assertIsDBUserId(userId);

    const { error: messageError } = await supabase
        .from("messages")
        .delete()
        .eq("chatId", chatId);

    if (messageError) throw new Error("Failed to delete chat messages");

    const { error } = await supabase.from("chats").delete().eq("id", chatId);

    if (error) throw new Error("Chat delete failed");

    revalidateTag(tag.userChats(userId));
    revalidateTag(tag.userSharedChats(userId));
    revalidateTag(tag.userChatsSearch(userId));
    revalidateTag(tag.chatVisibility(chatId));
}

export async function isUserChatOwner({
    chatId,
    userId,
}: WithChatId & WithUserId): Promise<boolean> {
    assertIsDBChatId(chatId);
    assertIsDBUserId(userId);

    const { data, error } = await supabase
        .from("chats")
        .select("id")
        .eq("id", chatId)
        .eq("userId", userId)
        .single();

    if (error) throw new Error("Failed to check chat ownership");

    return !!data;
}

export async function updateChatTitle({
    newTitle,
    chatId,
    userId,
}: {
    newTitle: string;
} & WithChatId &
    WithUserId) {
    assertIsDBChatId(chatId);
    assertIsDBUserId(userId);
    assertIsNonEmptyString(newTitle);

    const { data, error } = await supabase
        .from("chats")
        .update({ title: newTitle })
        .eq("id", chatId)
        .eq("userId", userId)
        .select("*")
        .single();

    if (error) throw new Error("Failed to update chat title");

    revalidateTag(tag.userChats(userId));
    revalidateTag(tag.userChat(chatId));
    revalidateTag(tag.userSharedChats(userId));

    return data as DBChat;
}

export async function updateChatVisibility({
    visibility,
    chatId,
    userId,
}: WithChatId & WithUserId & WithVisibility) {
    assertIsDBChatId(chatId);
    assertIsDBUserId(userId);
    assertIsChatVisibility(visibility);

    const { data, error } = await supabase
        .from("chats")
        .update({ visibility, visibleAt: new Date().toISOString() })
        .eq("id", chatId)
        .eq("userId", userId)
        .select("visibility")
        .single();

    if (error) throw new Error("Failed to update chat visibility");

    revalidateTag(tag.userChat(chatId));
    revalidateTag(tag.userChats(userId));
    revalidateTag(tag.chatVisibility(chatId));
    revalidateTag(tag.userSharedChats(userId));

    return data;
}

export async function updateManyChatsVisibility({
    visibility,
    chatIds,
    userId,
}: {
    chatIds: DBChatId[];
} & WithUserId &
    WithVisibility) {
    assertIsDBUserId(userId);
    assertIsDBChatIds(chatIds);
    assertIsChatVisibility(visibility);

    const { data, error } = await supabase
        .from("chats")
        .update({ visibility, visibleAt: new Date().toISOString() })
        .eq("userId", userId)
        .in("id", chatIds)
        .select("*");

    if (error) throw new Error("Failed to update chat visibility");

    revalidateTag(tag.userChats(userId));
    revalidateTag(tag.userSharedChats(userId));
    revalidateTag(tag.userChatsSearch(userId));
    chatIds.forEach(chatId => {
        revalidateTag(tag.chatVisibility(chatId));
    });

    return data as DBChat[];
}

export async function setAllUserChatsVisibility({
    visibility,
    userId,
}: WithVisibility & WithUserId) {
    assertIsDBUserId(userId);
    assertIsChatVisibility(visibility);

    const { error } = await supabase
        .from("chats")
        .update({ visibility, visibleAt: new Date().toISOString() })
        .eq("userId", userId);

    if (error) throw new Error("Failed to set all chats visibility");

    revalidateTag(tag.userChats(userId));
    revalidateTag(tag.userSharedChats(userId));
    revalidateTag(tag.userChatsSearch(userId));
}

export async function getChatVisibility({ chatId }: WithChatId) {
    "use cache";
    assertIsDBChatId(chatId);
    cacheTag(tag.chatVisibility(chatId));

    const { data, error } = await supabase
        .from("chats")
        .select("visibility, userId")
        .eq("id", chatId)
        .single();
    if (error) throw new Error("Failed to fetch chat visibility");

    return data as Pick<DBChat, "visibility" | "userId"> | null;
}

export async function getUserSharedChats({
    userId,
    offset = 0,
    limit = Number.MAX_SAFE_INTEGER,
}: WithOptionalOffset & WithOptionalLimit & WithUserId): Promise<
    PaginatedData<DBChat[]>
> {
    "use cache";
    assertIsDBUserId(userId);
    assertIsNumber(offset);
    assertIsNumber(limit);
    cacheTag(tag.userSharedChats(userId));

    const safeOffset = Math.max(0, offset);
    const safeLimit = Math.max(1, limit);
    const from = safeOffset;
    const to = safeOffset + safeLimit - 1;

    const { data, error, count } = await supabase
        .from("chats")
        .select("*", { count: "exact" })
        .eq("visibility", "public")
        .eq("userId", userId)
        .order("visibleAt", { ascending: false })
        .range(from, to);

    if (error) throw new Error("Failed to fetch shared chats");

    const totalCount = count ?? 0;
    const hasNextPage = to + 1 < totalCount;
    const nextOffset = hasNextPage ? to + 1 : undefined;

    const sortedData = (data as DBChat[]).sort(
        (a, b) =>
            new Date(b.visibleAt).getTime() - new Date(a.visibleAt).getTime(),
    );

    return {
        data: sortedData ?? [],
        totalCount,
        hasNextPage,
        nextOffset,
    };
}

export async function searchUserChats({
    userId,
    query,
    cursor,
    limit = Number.MAX_SAFE_INTEGER,
}: WithQuery & WithOptionalCursor & WithOptionalLimit & WithUserId): Promise<
    PaginatedData<DBChatSearchResult[]>
> {
    "use cache";
    assertIsDBUserId(userId);
    assertIsNonEmptyString(query);
    assertIsNumber(limit);
    if (cursor) assertIsDateCursor(cursor);

    cacheTag(tag.userChatsSearch(userId, query));
    cacheTag(tag.userChats(userId));

    const messageQuery = supabase
        .from("messages")
        .select("chatId, content")
        .eq("userId", userId)
        .ilike("content", `%${query}%`);

    const { data: messageMatches, error: messageQueryError } =
        await messageQuery;

    if (messageQueryError) {
        throw new Error(
            `Failed to query message chat IDs: ${messageQueryError.message}`,
        );
    }

    const contentMatchingChatIds = [
        ...new Set(messageMatches?.map(m => m.chatId) || []),
    ];

    let chatQuery = supabase
        .from("chats")
        .select("*")
        .eq("userId", userId)
        .or(
            `id.in.(${contentMatchingChatIds.join(",")}),title.ilike.%${query}%`,
        );

    if (cursor) {
        chatQuery = chatQuery.or(
            `createdAt.lt.${cursor.date},and(createdAt.eq.${cursor.date},id.lt.${cursor.id})`,
        );
    }

    const { data: chatMatches, error: chatQueryError } = await chatQuery
        .order("createdAt", { ascending: false })
        .limit(limit + 1);
    if (chatQueryError) {
        throw new Error(`Failed to query chats: ${chatQueryError.message}`);
    }

    const transformedData =
        chatMatches?.map(chat => {
            const matchesContent = contentMatchingChatIds.includes(chat.id);
            const contentToUse = matchesContent
                ? messageMatches?.find(m => m.chatId === chat.id)?.content ||
                  chat.title
                : chat.title;

            return {
                ...chat,
                id: chat.id as DBChatId,
                snippet: extractQuerySnippet(contentToUse, query),
                userId,
            };
        }) || [];

    const hasNextPage = transformedData.length > limit;
    const pageResults = hasNextPage
        ? transformedData.slice(0, limit)
        : transformedData;

    let nextCursor: DateCursor | undefined;
    if (hasNextPage && pageResults.length > 0) {
        const lastItem = pageResults[pageResults.length - 1];
        nextCursor = {
            date: lastItem.createdAt,
            id: lastItem.id,
        };
    }

    return {
        data: pageResults,
        totalCount: transformedData.length,
        hasNextPage,
        cursor: nextCursor,
    };
}

export async function upvoteChatMessage({
    upvote,
    messageId,
    userId,
    chatId,
}: WithUpvote & WithChatId & WithUserId & WithChatMessageId) {
    assertIsUpvote(upvote);
    assertIsDBChatMessageId(messageId);
    assertIsDBUserId(userId);
    assertIsDBChatId(chatId);

    const { data: currentMessage } = await supabase
        .from("messages")
        .select("metadata")
        .eq("id", messageId)
        .eq("userId", userId)
        .eq("chatId", chatId)
        .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentMetadata = (currentMessage?.metadata as any) || {};

    const { data, error } = await supabase
        .from("messages")
        .update({
            metadata: {
                ...currentMetadata,
                isUpvoted: upvote,
                isDownvoted: false,
            },
        })
        .eq("id", messageId)
        .eq("userId", userId)
        .eq("chatId", chatId)
        .select("*")
        .single();

    if (error) throw new Error("Failed to upvote message");

    revalidateTag(tag.chatMessages(chatId));

    return data as unknown as UIChatMessage | null;
}

export async function downvoteChatMessage({
    downvote,
    messageId,
    userId,
    chatId,
}: WithDownvote & WithChatId & WithUserId & WithChatMessageId) {
    assertIsDBChatMessageId(messageId);
    assertIsDownvote(downvote);
    assertIsDBUserId(userId);
    assertIsDBChatId(chatId);

    const { data: currentMessage } = await supabase
        .from("messages")
        .select("metadata")
        .eq("id", messageId)
        .eq("userId", userId)
        .eq("chatId", chatId)
        .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentMetadata = (currentMessage?.metadata as any) || {};

    const { data, error } = await supabase
        .from("messages")
        .update({
            metadata: {
                ...currentMetadata,
                isDownvoted: downvote,
                isUpvoted: false,
            },
        })
        .eq("id", messageId)
        .eq("userId", userId)
        .eq("chatId", chatId)
        .select("*")
        .single();

    if (error) throw new Error("Failed to downvote message");

    revalidateTag(tag.chatMessages(chatId));

    return data as unknown as UIChatMessage | null;
}

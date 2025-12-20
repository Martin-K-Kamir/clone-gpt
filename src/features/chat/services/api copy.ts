// import type {
//     DBChat,
//     DBChatSearchResult,
//     DBChatVisibility,
//     WithChatId,
//     WithIsOwner,
// } from "@/features/chat/lib/types";

// import type { ApiResponse } from "@/lib/api-response";
// import type {
//     DateCursor,
//     PaginatedData,
//     WithOptionalCursor,
//     WithOptionalFromDate,
//     WithOptionalLimit,
//     WithOptionalOffset,
//     WithOptionalOrderBy,
//     WithOptionalQuery,
//     WithOptionalToDate,
// } from "@/lib/types";

// export async function getUserChats({
//     offset,
//     limit,
//     orderBy,
// }: WithOptionalOffset & WithOptionalLimit & WithOptionalOrderBy): Promise<{
//     data: DBChat[];
//     hasNextPage: boolean;
//     nextOffset?: number;
//     totalCount: number;
// }> {
//     const params = new URLSearchParams();

//     if (offset !== undefined) {
//         params.set("offset", offset.toString());
//     }

//     if (limit !== undefined) {
//         params.set("limit", limit.toString());
//     }

//     if (orderBy !== undefined) {
//         params.set("orderBy", orderBy);
//     }

//     const resopnse = await fetch(`/api/user-chats?${params}`);

//     if (!resopnse.ok) {
//         throw new Error("Failed to fetch user chats");
//     }

//     const result = (await resopnse.json()) as ApiResponse<
//         PaginatedData<DBChat[]>
//     >;

//     if (!result.success) {
//         throw new Error(result.message);
//     }

//     return result.data;
// }

// export async function getUserChatsByDate({
//     from,
//     to,
//     limit,
//     orderBy,
// }: WithOptionalFromDate &
//     WithOptionalToDate &
//     WithOptionalLimit &
//     WithOptionalOrderBy): Promise<DBChat[]> {
//     const params = new URLSearchParams();

//     if (from) {
//         params.set("from", from.toISOString());
//     }

//     if (to) {
//         params.set("to", to.toISOString());
//     }

//     if (limit !== undefined) {
//         params.set("limit", limit.toString());
//     }

//     if (orderBy !== undefined) {
//         params.set("orderBy", orderBy);
//     }

//     const response = await fetch(`/api/user-chats?${params}`);

//     if (!response.ok) {
//         throw new Error("Failed to fetch user chats by date");
//     }

//     const result = (await response.json()) as ApiResponse<DBChat[]>;

//     if (!result.success) {
//         throw new Error(result.message);
//     }

//     return result.data;
// }

// export async function getUserChatById({
//     chatId,
// }: WithChatId): Promise<DBChat & WithIsOwner> {
//     if (!chatId) {
//         throw new Error("Chat ID is required to fetch a chat");
//     }

//     const response = await fetch(`/api/user-chats/${chatId}`, {
//         cache: "no-store",
//     });

//     if (!response.ok) {
//         throw new Error("Failed to fetch chat by ID");
//     }

//     const result = (await response.json()) as ApiResponse<DBChat & WithIsOwner>;

//     if (!result.success) {
//         throw new Error(result.message);
//     }

//     return result.data;
// }

// export async function searchUserChats({
//     query,
//     cursor,
//     limit,
// }: WithOptionalQuery & WithOptionalCursor & WithOptionalLimit): Promise<{
//     data: DBChatSearchResult[];
//     hasNextPage: boolean;
//     cursor?: DateCursor;
// }> {
//     const params = new URLSearchParams();

//     if (limit !== undefined) {
//         params.set("limit", limit.toString());
//     }

//     if (query) {
//         params.set("query", query);
//     }

//     if (cursor) {
//         params.set("cursorDate", cursor.date);
//         params.set("cursorId", cursor.id);
//     }

//     const response = await fetch(`/api/user-chats/search?${params}`, {
//         cache: "no-store",
//     });

//     if (!response.ok) {
//         throw new Error("Failed to search user chats");
//     }

//     const result = (await response.json()) as ApiResponse<
//         PaginatedData<DBChatSearchResult[]>
//     >;

//     if (!result.success) {
//         throw new Error(result.message);
//     }

//     return result.data;
// }

// export async function getUserSharedChats({
//     offset,
//     limit,
// }: WithOptionalOffset & WithOptionalLimit): Promise<{
//     data: DBChat[];
//     hasNextPage: boolean;
//     nextOffset?: number;
//     totalCount: number;
// }> {
//     const params = new URLSearchParams();
//     if (offset !== undefined) params.set("offset", String(offset));
//     if (limit !== undefined) params.set("limit", String(limit));

//     const response = await fetch(`/api/user-chats/shared?${params}`);

//     if (!response.ok) {
//         throw new Error("Failed to fetch user shared chats");
//     }

//     const result = (await response.json()) as ApiResponse<
//         PaginatedData<DBChat[]>
//     >;

//     if (!result.success) {
//         throw new Error(result.message);
//     }

//     return result.data;
// }

// export async function getUserChatVisibility({
//     chatId,
// }: WithChatId): Promise<DBChatVisibility> {
//     const response = await fetch(`/api/user-chats/visibility/${chatId}`);

//     if (!response.ok) {
//         throw new Error("Failed to fetch chat visibility");
//     }

//     const result = (await response.json()) as ApiResponse<DBChatVisibility>;

//     if (!result.success) {
//         throw new Error(result.message);
//     }

//     return result.data;
// }

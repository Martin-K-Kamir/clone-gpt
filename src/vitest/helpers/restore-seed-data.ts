import { supabase } from "@/services/supabase";

export async function restoreSeedData() {
    // Delete test-specific data first
    await supabase
        .from("messages")
        .delete()
        .gte("id", "40000000-0000-0000-0000-000000000100");

    await supabase
        .from("chats")
        .delete()
        .gte("id", "30000000-0000-0000-0000-000000000100");

    // Restore seed users
    const { error: usersError } = await supabase.from("users").upsert([
        {
            id: "00000000-0000-0000-0000-000000000001",
            email: "seed-user1@example.com",
            name: "Seed User 1",
            role: "user",
            createdAt: new Date("2024-01-01T00:00:00Z").toISOString(),
        },
        {
            id: "00000000-0000-0000-0000-000000000002",
            email: "seed-user2@example.com",
            name: "Seed User 2",
            role: "user",
            createdAt: new Date("2024-01-01T00:00:00Z").toISOString(),
        },
        {
            id: "00000000-0000-0000-0000-000000000003",
            email: "seed-admin@example.com",
            name: "Seed Admin",
            role: "admin",
            createdAt: new Date("2024-01-01T00:00:00Z").toISOString(),
        },
    ]);

    if (usersError) {
        console.error("Error restoring users:", usersError);
    }

    // Restore seed chats
    const { error: chatsError } = await supabase.from("chats").upsert([
        {
            id: "30000000-0000-0000-0000-000000000001",
            userId: "00000000-0000-0000-0000-000000000001",
            title: "Seed Private Chat",
            visibility: "private",
            visibleAt: new Date("2024-01-01T00:00:00Z").toISOString(),
            createdAt: new Date("2024-01-01T00:00:00Z").toISOString(),
            updatedAt: new Date("2024-01-01T00:00:00Z").toISOString(),
        },
        {
            id: "30000000-0000-0000-0000-000000000002",
            userId: "00000000-0000-0000-0000-000000000001",
            title: "Seed Public Chat",
            visibility: "public",
            visibleAt: new Date("2024-01-01T00:00:01Z").toISOString(),
            createdAt: new Date("2024-01-01T00:00:01Z").toISOString(),
            updatedAt: new Date("2024-01-01T00:00:01Z").toISOString(),
        },
        {
            id: "30000000-0000-0000-0000-000000000003",
            userId: "00000000-0000-0000-0000-000000000002",
            title: "Seed User2 Chat",
            visibility: "private",
            visibleAt: new Date("2024-01-01T00:00:02Z").toISOString(),
            createdAt: new Date("2024-01-01T00:00:02Z").toISOString(),
            updatedAt: new Date("2024-01-01T00:00:02Z").toISOString(),
        },
    ]);

    if (chatsError) {
        console.error("Error restoring chats:", chatsError);
    }

    // Restore seed messages
    const { error: messagesError } = await supabase.from("messages").upsert([
        {
            id: "40000000-0000-0000-0000-000000000001",
            chatId: "30000000-0000-0000-0000-000000000001",
            userId: "00000000-0000-0000-0000-000000000001",
            role: "user",
            content: "Hello from seed user 1",
            metadata: {},
            parts: [],
            createdAt: new Date("2024-01-01T00:00:00Z").toISOString(),
        },
        {
            id: "40000000-0000-0000-0000-000000000002",
            chatId: "30000000-0000-0000-0000-000000000001",
            userId: "00000000-0000-0000-0000-000000000001",
            role: "assistant",
            content: "Hello, seed!",
            metadata: {},
            parts: [],
            createdAt: new Date("2024-01-01T00:00:01Z").toISOString(),
        },
        {
            id: "40000000-0000-0000-0000-000000000003",
            chatId: "30000000-0000-0000-0000-000000000002",
            userId: "00000000-0000-0000-0000-000000000001",
            role: "user",
            content: "Public chat message",
            metadata: {},
            parts: [],
            createdAt: new Date("2024-01-01T00:00:00Z").toISOString(),
        },
    ]);

    if (messagesError) {
        console.error("Error restoring messages:", messagesError);
    }

    // Restore seed rate limits - use upsert to ensure it exists
    const { error: rateLimitsError } = await supabase
        .from("user_messages_rate_limits")
        .upsert({
            id: "22222222-0000-0000-0000-000000000001",
            userId: "00000000-0000-0000-0000-000000000001",
            messagesCounter: 0,
            tokensCounter: 0,
            isOverLimit: false,
            periodStart: null,
            periodEnd: null,
            createdAt: new Date("2024-01-01T00:00:00Z").toISOString(),
            updatedAt: new Date("2024-01-01T00:00:00Z").toISOString(),
        });

    if (rateLimitsError) {
        console.error("Error restoring rate limits:", rateLimitsError);
    }

    // Restore seed user preferences - use upsert with onConflict for userId
    const { error: preferencesError } = await supabase
        .from("user_preferences")
        .upsert(
            [
                {
                    userId: "00000000-0000-0000-0000-000000000001",
                    personality: "FRIENDLY",
                    nickname: "Alpha",
                    createdAt: new Date("2024-01-01T00:00:00Z").toISOString(),
                },
                {
                    userId: "00000000-0000-0000-0000-000000000002",
                    personality: "NERD",
                    nickname: "Beta",
                    createdAt: new Date("2024-01-01T00:00:00Z").toISOString(),
                },
            ],
            { onConflict: "userId" },
        );

    if (preferencesError) {
        console.error("Error restoring preferences:", preferencesError);
    }
}

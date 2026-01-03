import { supabase } from "@/services/supabase";

export async function restoreSeedData() {
    await supabase
        .from("messages")
        .delete()
        .gte("id", "40000000-0000-0000-0000-000000000100");

    await supabase
        .from("chats")
        .delete()
        .gte("id", "30000000-0000-0000-0000-000000000100");

    const seedUserIds = [
        "00000000-0000-0000-0000-000000000001",
        "00000000-0000-0000-0000-000000000002",
        "00000000-0000-0000-0000-000000000003",
        "00000000-0000-0000-0000-000000000010",
        "00000000-0000-0000-0000-000000000011",
        "00000000-0000-0000-0000-000000000020",
        "00000000-0000-0000-0000-000000000021",
        "00000000-0000-0000-0000-000000000030",
        "00000000-0000-0000-0000-000000000031",
    ];

    const [filesDeleteResult, messagesDeleteResult] = await Promise.all([
        supabase
            .from("user_files_rate_limits")
            .delete()
            .in("userId", seedUserIds),
        supabase
            .from("user_messages_rate_limits")
            .delete()
            .in("userId", seedUserIds),
    ]);

    if (filesDeleteResult.error) {
        console.error(
            "Error deleting files rate limits:",
            filesDeleteResult.error,
        );
    }
    if (messagesDeleteResult.error) {
        console.error(
            "Error deleting messages rate limits:",
            messagesDeleteResult.error,
        );
    }

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
        {
            id: "00000000-0000-0000-0000-000000000010",
            email: "seed-check-files@example.com",
            name: "Check Files User",
            role: "user",
            createdAt: new Date("2024-01-01T00:00:00Z").toISOString(),
        },
        {
            id: "00000000-0000-0000-0000-000000000011",
            email: "seed-check-messages@example.com",
            name: "Check Messages User",
            role: "user",
            createdAt: new Date("2024-01-01T00:00:00Z").toISOString(),
        },
        {
            id: "00000000-0000-0000-0000-000000000020",
            email: "seed-increment-files@example.com",
            name: "Increment Files User",
            role: "user",
            createdAt: new Date("2024-01-01T00:00:00Z").toISOString(),
        },
        {
            id: "00000000-0000-0000-0000-000000000021",
            email: "seed-increment-messages@example.com",
            name: "Increment Messages User",
            role: "user",
            createdAt: new Date("2024-01-01T00:00:00Z").toISOString(),
        },
        {
            id: "00000000-0000-0000-0000-000000000030",
            email: "seed-update-files@example.com",
            name: "Update Files User",
            role: "user",
            createdAt: new Date("2024-01-01T00:00:00Z").toISOString(),
        },
        {
            id: "00000000-0000-0000-0000-000000000031",
            email: "seed-update-messages@example.com",
            name: "Update Messages User",
            role: "user",
            createdAt: new Date("2024-01-01T00:00:00Z").toISOString(),
        },
    ]);

    if (usersError) {
        console.error("Error restoring users:", usersError);
    }

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

    const filesRateLimitIds = [
        "11111111-0000-0000-0000-000000000001",
        "11111111-0000-0000-0000-000000000002",
        "11111111-0000-0000-0000-000000000010",
        "11111111-0000-0000-0000-000000000020",
        "11111111-0000-0000-0000-000000000030",
    ];
    await supabase
        .from("user_files_rate_limits")
        .delete()
        .in("id", filesRateLimitIds);

    await supabase
        .from("user_files_rate_limits")
        .delete()
        .in("userId", seedUserIds);

    const { error: filesRateLimitsError } = await supabase
        .from("user_files_rate_limits")
        .insert([
            {
                id: "11111111-0000-0000-0000-000000000001",
                userId: "00000000-0000-0000-0000-000000000001",
                filesCounter: 0,
                isOverLimit: false,
                periodStart: null,
                periodEnd: null,
                createdAt: new Date("2024-01-01T00:00:00Z").toISOString(),
                updatedAt: new Date("2024-01-01T00:00:00Z").toISOString(),
            },
            {
                id: "11111111-0000-0000-0000-000000000002",
                userId: "00000000-0000-0000-0000-000000000002",
                filesCounter: 0,
                isOverLimit: false,
                periodStart: null,
                periodEnd: null,
                createdAt: new Date("2024-01-01T00:00:00Z").toISOString(),
                updatedAt: new Date("2024-01-01T00:00:00Z").toISOString(),
            },
            {
                id: "11111111-0000-0000-0000-000000000010",
                userId: "00000000-0000-0000-0000-000000000010",
                filesCounter: 11,
                isOverLimit: false,
                periodStart: null,
                periodEnd: null,
                createdAt: new Date("2024-01-01T00:00:00Z").toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: "11111111-0000-0000-0000-000000000020",
                userId: "00000000-0000-0000-0000-000000000020",
                filesCounter: 0,
                isOverLimit: false,
                periodStart: null,
                periodEnd: null,
                createdAt: new Date("2024-01-01T00:00:00Z").toISOString(),
                updatedAt: new Date("2024-01-01T00:00:00Z").toISOString(),
            },
            {
                id: "11111111-0000-0000-0000-000000000030",
                userId: "00000000-0000-0000-0000-000000000030",
                filesCounter: 0,
                isOverLimit: false,
                periodStart: null,
                periodEnd: null,
                createdAt: new Date("2024-01-01T00:00:00Z").toISOString(),
                updatedAt: new Date("2024-01-01T00:00:00Z").toISOString(),
            },
        ]);

    if (filesRateLimitsError) {
        console.error(
            "Error restoring files rate limits:",
            filesRateLimitsError,
        );
    }

    const messagesRateLimitIds = [
        "22222222-0000-0000-0000-000000000001",
        "22222222-0000-0000-0000-000000000002",
        "22222222-0000-0000-0000-000000000011",
        "22222222-0000-0000-0000-000000000021",
        "22222222-0000-0000-0000-000000000031",
    ];
    await supabase
        .from("user_messages_rate_limits")
        .delete()
        .in("id", messagesRateLimitIds);

    await supabase
        .from("user_messages_rate_limits")
        .delete()
        .in("userId", seedUserIds);

    const { error: messagesRateLimitsError } = await supabase
        .from("user_messages_rate_limits")
        .insert([
            {
                id: "22222222-0000-0000-0000-000000000001",
                userId: "00000000-0000-0000-0000-000000000001",
                messagesCounter: 0,
                tokensCounter: 0,
                isOverLimit: false,
                periodStart: null,
                periodEnd: null,
                createdAt: new Date("2024-01-01T00:00:00Z").toISOString(),
                updatedAt: new Date("2024-01-01T00:00:00Z").toISOString(),
            },
            {
                id: "22222222-0000-0000-0000-000000000002",
                userId: "00000000-0000-0000-0000-000000000002",
                messagesCounter: 101,
                tokensCounter: 0,
                isOverLimit: false,
                periodStart: null,
                periodEnd: null,
                createdAt: new Date("2024-01-01T00:00:00Z").toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: "22222222-0000-0000-0000-000000000011",
                userId: "00000000-0000-0000-0000-000000000011",
                messagesCounter: 0,
                tokensCounter: 10001,
                isOverLimit: false,
                periodStart: null,
                periodEnd: null,
                createdAt: new Date("2024-01-01T00:00:00Z").toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: "22222222-0000-0000-0000-000000000021",
                userId: "00000000-0000-0000-0000-000000000021",
                messagesCounter: 0,
                tokensCounter: 0,
                isOverLimit: false,
                periodStart: null,
                periodEnd: null,
                createdAt: new Date("2024-01-01T00:00:00Z").toISOString(),
                updatedAt: new Date("2024-01-01T00:00:00Z").toISOString(),
            },
            {
                id: "22222222-0000-0000-0000-000000000031",
                userId: "00000000-0000-0000-0000-000000000031",
                messagesCounter: 0,
                tokensCounter: 0,
                isOverLimit: false,
                periodStart: null,
                periodEnd: null,
                createdAt: new Date("2024-01-01T00:00:00Z").toISOString(),
                updatedAt: new Date("2024-01-01T00:00:00Z").toISOString(),
            },
        ]);

    if (messagesRateLimitsError) {
        console.error(
            "Error restoring messages rate limits:",
            messagesRateLimitsError,
        );
    }

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

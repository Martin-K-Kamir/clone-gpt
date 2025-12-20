import { openai } from "@ai-sdk/openai";
import { geolocation } from "@vercel/functions";
import {
    type ToolSet,
    convertToModelMessages,
    smoothStream,
    stepCountIs,
    streamText,
    validateUIMessages,
} from "ai";
import { NextRequest } from "next/server";

import { assertSessionExists } from "@/features/auth/lib/asserts";
import { auth } from "@/features/auth/services/auth";

import { chatSystemMessage } from "@/features/chat/lib/ai/system-messages";
import { chatTools } from "@/features/chat/lib/ai/tools";
import { assertIsChatRequestBodyValid } from "@/features/chat/lib/asserts";
import {
    CHAT_ROLE,
    CHAT_TRIGGER,
    CHAT_VISIBILITY,
} from "@/features/chat/lib/constants";
import {
    ChatTrigger,
    DBChatId,
    DBChatMessageId,
    UIChatMessage,
} from "@/features/chat/lib/types";
import {
    checkForFilesInMessage,
    countFilesInMessage,
    createAssistantMetadata,
    createChatTitleFromMessage,
} from "@/features/chat/lib/utils";
import { generateChatTitle } from "@/features/chat/services/ai";
import {
    createUserChat,
    deleteUserChatMessagesStartingFrom,
    duplicateUserChat,
    storeUserChatMessage,
    storeUserChatMessages,
    uncachedGetUserChatById,
    uncachedGetUserChatMessages,
    updateUserChat,
    updateUserChatMessage,
} from "@/features/chat/services/db";

import { DBUserId, DBUserRole } from "@/features/user/lib/types";
import {
    checkUserFilesRateLimit,
    checkUserMessagesRateLimit,
    incrementUserFilesRateLimit,
    incrementUserMessagesRateLimit,
} from "@/features/user/services/db";

import { api } from "@/lib/api-response";
import { removePunctuation } from "@/lib/utils";
import { handleApiErrorResponse } from "@/lib/utils/handle-api-error";

export const preferredRegion = "fra1";
export const maxDuration = 280;

const MODEL: Parameters<typeof openai>[0] = "gpt-4o";

export async function POST(request: NextRequest) {
    try {
        const [requestBody, session] = await Promise.all([
            request.json(),
            await auth(),
        ]);
        assertIsChatRequestBodyValid(requestBody);
        assertSessionExists(session);

        console.log("[chat] request body:", requestBody);
        console.log("[chat] session:", session);

        const {
            message,
            userChatPreferences,
            chatId,
            newChatId,
            trigger,
            messageId,
            body,
        } = requestBody;
        const filesCountInMessage = countFilesInMessage(message);
        const hasFilesInMessage = checkForFilesInMessage(message);

        console.log("[chat] files count in message:", filesCountInMessage);
        console.log("[chat] has files in message:", hasFilesInMessage);

        const rateLimitError = await checkRateLimits({
            userId: session.user.id,
            userRole: session.user.role,
            checkFiles: hasFilesInMessage,
        });
        console.log("[chat] rate limit error:", rateLimitError);
        if (rateLimitError) return rateLimitError;

        const { chatId: resolvedChatId, error: chatAccessError } =
            await ensureChatAccess({
                chatId,
                newChatId,
                trigger,
                message,
                userId: session.user.id,
            });
        console.log("[chat] chat access error:", chatAccessError);
        if (chatAccessError) return chatAccessError;

        const validatedMessages = await prepareMessages({
            chatId: resolvedChatId,
            message,
            userId: session.user.id,
        });
        console.log("[chat] validated messages:", validatedMessages);
        const userGeolocation = getUserGeolocation(request);
        console.log("[chat] user geolocation:", userGeolocation);

        const result = streamText({
            model: openai(MODEL),
            system: chatSystemMessage(userChatPreferences, userGeolocation),
            messages: convertToModelMessages(validatedMessages),
            tools: {
                ...chatTools({
                    chatId: resolvedChatId,
                    userId: session.user.id,
                    geolocation: userGeolocation,
                }),
            } as ToolSet,
            stopWhen: stepCountIs(10),
            experimental_transform: smoothStream({ chunking: "word" }),
        });

        result.consumeStream();

        return result.toUIMessageStreamResponse<UIChatMessage>({
            sendSources: true,
            originalMessages: validatedMessages,
            messageMetadata: ({ part }) =>
                createAssistantMetadata({ part, model: MODEL }),
            generateMessageId: () => crypto.randomUUID(),

            onFinish: async ({ responseMessage }) => {
                console.log("[chat] response message:", responseMessage);
                await handleMessageStorage({
                    chatId: resolvedChatId,
                    messageId,
                    trigger,
                    responseMessage,
                    userMessage: message,
                    userId: session.user.id,
                    regeneratedMessageRole: body?.regeneratedMessageRole,
                });

                console.log("[chat] updating user chat:");

                await updateUserChat({
                    chatId: resolvedChatId,
                    userId: session.user.id,
                    data: {
                        updatedAt: new Date().toISOString(),
                    },
                });

                console.log("[chat] updating rate limits:");
                await updateRateLimits({
                    userId: session.user.id,
                    responseMessage: responseMessage,
                    filesCount: filesCountInMessage,
                });
            },
        });
    } catch (error) {
        return handleApiErrorResponse(error, () =>
            api.error.chat.stream(error).toResponse(),
        );
    }
}

async function checkRateLimits({
    userId,
    userRole,
    checkFiles,
}: {
    userId: DBUserId;
    userRole: DBUserRole;
    checkFiles: boolean;
}) {
    const messagesRateLimit = await checkUserMessagesRateLimit({
        userId,
        userRole,
    });

    if (messagesRateLimit.isOverLimit) {
        return api.error.rateLimit
            .specific(messagesRateLimit, {
                periodEnd: messagesRateLimit.periodEnd,
                reason: messagesRateLimit.reason,
            })
            .toResponse();
    }

    if (checkFiles) {
        const filesRateLimit = await checkUserFilesRateLimit({
            userId,
            userRole,
        });

        if (filesRateLimit.isOverLimit) {
            return api.error.rateLimit
                .specific(filesRateLimit, {
                    periodEnd: filesRateLimit.periodEnd,
                    reason: filesRateLimit.reason,
                })
                .toResponse();
        }
    }

    return null;
}

async function ensureChatAccess({
    chatId,
    newChatId,
    trigger,
    userId,
    message,
}: {
    chatId: DBChatId;
    newChatId?: DBChatId;
    trigger: ChatTrigger;
    userId: DBUserId;
    message: UIChatMessage;
}): Promise<{ chatId: DBChatId; error: Response | null }> {
    const chat = await uncachedGetUserChatById({
        chatId,
        userId,
        verifyChatAccess: false,
        throwOnNotFound: false,
    });
    console.log("[chat] chat:", chat);

    if (!chat) {
        try {
            const generatedTitle = await generateChatTitle([message]);
            const titleFromMessage = createChatTitleFromMessage(message);

            const newChat = await createUserChat({
                chatId,
                userId,
                title: removePunctuation(generatedTitle ?? titleFromMessage),
                throwOnNotFound: false,
            });
            console.log("[chat] new chat:", newChat);
            if (!newChat) {
                return {
                    chatId,
                    error: api.error.chat.create().toResponse(),
                };
            }

            return {
                chatId: newChat.id,
                error: null,
            };
        } catch {
            return {
                chatId,
                error: api.error.chat.create().toResponse(),
            };
        }
    }

    if (!chat.isOwner && chat.visibility === CHAT_VISIBILITY.PRIVATE) {
        return {
            chatId,
            error: api.error.chat.unauthorized().toResponse(),
        };
    }

    const shouldDuplicateChat =
        trigger === CHAT_TRIGGER.SUBMIT_MESSAGE &&
        newChatId &&
        newChatId !== chatId &&
        !chat.isOwner &&
        chat.visibility === CHAT_VISIBILITY.PUBLIC;

    if (shouldDuplicateChat) {
        try {
            const newChat = await duplicateUserChat({
                chatId,
                newChatId,
                userId,
                throwOnNotFound: false,
            });

            if (!newChat) {
                return {
                    chatId,
                    error: api.error.chat.duplicate().toResponse(),
                };
            }

            return { chatId: newChat.id, error: null };
        } catch {
            return {
                chatId,
                error: api.error.chat.duplicate().toResponse(),
            };
        }
    }

    return { chatId, error: null };
}

async function prepareMessages({
    chatId,
    userId,
    message,
}: {
    chatId: DBChatId;
    userId: DBUserId;
    message: UIChatMessage;
}) {
    const { data: previousMessages } = await uncachedGetUserChatMessages({
        chatId,
        userId,
        verifyChatAccess: false,
    });

    return validateUIMessages<UIChatMessage>({
        messages: [...previousMessages, message],
    });
}

function getUserGeolocation(request: NextRequest) {
    if (process.env.NODE_ENV === "production") {
        const userGeolocation = geolocation(request);

        return {
            city: userGeolocation.city,
            country: userGeolocation.country,
            latitude: userGeolocation.latitude,
            longitude: userGeolocation.longitude,
        };
    }
    return {
        city: "Prague",
        country: "Czech Republic",
        latitude: "50.0755",
        longitude: "14.4378",
    };
}

async function handleMessageStorage({
    trigger,
    messageId,
    userMessage,
    responseMessage,
    chatId,
    userId,
    regeneratedMessageRole,
}: {
    trigger: string;
    messageId: DBChatMessageId | undefined;
    userMessage: UIChatMessage;
    responseMessage: UIChatMessage;
    chatId: DBChatId;
    userId: DBUserId;
    regeneratedMessageRole: string | undefined;
}) {
    if (trigger === CHAT_TRIGGER.SUBMIT_MESSAGE) {
        console.log("[chat] storing user chat messages:");
        await storeUserChatMessages({
            chatId,
            userId,
            messages: [userMessage, responseMessage],
        });
    }

    if (trigger === CHAT_TRIGGER.REGENERATE_MESSAGE && messageId) {
        console.log(
            "[chat] deleting user chat messages starting from message:",
            messageId,
        );
        await deleteUserChatMessagesStartingFrom({ messageId, chatId, userId });
        console.log("[chat] storing user chat message:", responseMessage);
        await storeUserChatMessage({
            chatId,
            userId,
            message: responseMessage,
        });

        if (regeneratedMessageRole === CHAT_ROLE.USER) {
            console.log("[chat] updating user chat message:", userMessage);
            await updateUserChatMessage({
                chatId,
                userId,
                message: userMessage,
            });
        }
    }
}

async function updateRateLimits({
    userId,
    responseMessage,
    filesCount,
}: {
    userId: DBUserId;
    responseMessage: UIChatMessage;
    filesCount: number;
}) {
    if (responseMessage.metadata?.role === "assistant") {
        console.log("[chat] incrementing user messages rate limit:");
        await incrementUserMessagesRateLimit({
            userId,
            increments: {
                messages: 1,
                tokens: responseMessage.metadata.totalTokens,
            },
        });
    }

    if (filesCount > 0) {
        console.log("[chat] incrementing user files rate limit:");
        await incrementUserFilesRateLimit({
            userId,
            increments: {
                files: filesCount,
            },
        });
    }
}

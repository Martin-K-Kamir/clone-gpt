import { HTTP_ERROR_STATUS, HTTP_SUCCESS_STATUS } from "@/lib/constants";

type MessageValue = string | { message: string; status: number };

type MessageRecord = {
    [K: string]: MessageValue | MessageRecord;
};

export const API_RESPONSE_MESSAGES = {
    error: {
        validation: {
            message: "Invalid input data",
            status: HTTP_ERROR_STATUS.BAD_REQUEST,
        },
        notFound: {
            message: "Resource not found",
            status: HTTP_ERROR_STATUS.NOT_FOUND,
        },
        network: {
            offline: "Network is offline",
        },
        auth: {
            general: "An unexpected error occurred. Please try again.",
            validation: {
                message: "Invalid credentials",
                status: HTTP_ERROR_STATUS.BAD_REQUEST,
            },
            emailExists: {
                message: "An account with this email already exists",
                status: HTTP_ERROR_STATUS.BAD_REQUEST,
            },
        },
        session: {
            invalid: {
                message: "Session is not valid",
                status: HTTP_ERROR_STATUS.BAD_REQUEST,
            },
            authentication: {
                message: "User not authenticated",
                status: HTTP_ERROR_STATUS.UNAUTHORIZED,
            },
            authorization: {
                message:
                    "User does not have permission to access this resource",
                status: HTTP_ERROR_STATUS.FORBIDDEN,
            },
        },
        rateLimit: {
            general: {
                message: "Rate limit exceeded. Please try again later.",
                status: HTTP_ERROR_STATUS.TOO_MANY_REQUESTS,
            },
            specific: {
                message:
                    "You have exceeded your daily limit for {reason}. Please try again after {periodEnd}.",
                status: HTTP_ERROR_STATUS.TOO_MANY_REQUESTS,
            },
        },
        file: {
            upload: "Failed to upload {fileName}",
            uploadMany:
                "Failed to upload {count, plural, one [file] other [files]}",
            delete: "Failed to delete {fileName}",
            deleteMany:
                "Failed to delete {count, plural, one [file] other [files]}",
            empty: {
                message: "No files to cleanup",
                status: HTTP_ERROR_STATUS.BAD_REQUEST,
            },
        },
        chat: {
            get: "Failed to get user {count, plural, one [chat] other [chats]}",
            delete: "Failed to delete {count, plural, one [chat] other [chats]}",
            update: "Failed to update {count, plural, one [chat] other [chats]}",
            search: "Failed to search user chats",
            create: "Failed to create chat",
            store: "Failed to store chat",
            rename: "Failed to rename chat",
            visibility:
                "Failed to update {count, plural, one [chat] other [chats]} visibility to {visibility}",
            getShared:
                "Failed to get user public {count, plural, one [chat] other [chats]}",
            upvote: "Failed to upvote message",
            downvote: "Failed to downvote message",
            notFound: {
                message: "Chat not found",
                status: HTTP_ERROR_STATUS.NOT_FOUND,
            },
            stream: "Unexpected error while streaming chat",
            unauthorized: {
                message: "User does not have permission to access this chat",
                status: HTTP_ERROR_STATUS.FORBIDDEN,
            },
            duplicate: "Failed to duplicate chat",
            connection:
                "We're having trouble sending your message. Please check your internet connection and try again.",
        },
        message: {
            delete: "Failed to delete {count, plural, one [message] other [messages]}",
        },
        user: {
            get: "Failed to get user data",
            updateName: "Failed to update user name",
            notFound: {
                message: "User not found",
                status: HTTP_ERROR_STATUS.NOT_FOUND,
            },
            delete: "Failed to delete user",
            updateChatPreferences: "Failed to update user chat preferences",
            getChatPreferences: "Failed to get user chat preferences",
            checkRateLimit: "Failed to check user rate limit",
        },
    },
    success: {
        auth: {
            signup: "Account created successfully!",
            signin: "Signed in successfully!",
            signout: "Signed out successfully!",
        },
        session: {
            authenticate: "User authenticated successfully",
            authorize: "User authorized successfully",
        },
        file: {
            upload: "Successfully uploaded {fileName}",
            uploadMany:
                "Successfully uploaded {count, plural, one [file] other [files]}",
            deleteMany:
                "Successfully deleted {count, plural, one [file] other [files]}",
            delete: "Successfully deleted {fileName}",
        },
        chat: {
            get: "Successfully retrieved {count, plural, one [chat] other [chats]}",
            delete: "{count, plural, one [Chat] other [chats]} deleted successfully",
            update: "{count, plural, one [Chat] other [chats]} updated successfully",
            create: {
                message: "Chat created successfully",
                status: HTTP_SUCCESS_STATUS.CREATED,
            },
            search: "Successfully searched chats",
            store: "Chat stored successfully",
            rename: "Chat renamed successfully",
            visibility:
                "{count, plural, one [Chat] other [chats]} visibility updated successfully to {visibility}",
            getShared:
                "Successfully retrieved {count, plural, one [public chat] other [public chats]}",
            upvote: "Message upvoted successfully",
            downvote: "Message downvoted successfully",
        },
        message: {
            delete: "{count, plural, one [message] other [messages]} deleted successfully",
        },
        user: {
            get: "Successfully retrieved user data",
            updateName: "User name updated successfully",
            delete: "User deleted successfully",
            updateChatPreferences: "User chat preferences updated successfully",
            getChatPreferences: "User chat preferences retrieved successfully",
            checkRateLimit: "User rate limit checked successfully",
        },
    },
} as const satisfies Record<"error" | "success", MessageRecord>;

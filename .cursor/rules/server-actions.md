# Server Actions Patterns

## Overview

Server Actions are async functions that run on the server. They can be called directly from Client Components and provide a type-safe way to perform server-side mutations without creating API routes.

## File Organization

Server actions are organized by feature in individual files under `features/[feature]/services/actions/[action-name]/[action-name].ts`:

```
features/
├── auth/
│   └── services/
│       └── actions/
│           ├── sign-in/
│           │   └── sign-in.ts
│           ├── sign-up/
│           │   └── sign-up.ts
│           └── sign-out/
│               └── sign-out.ts
├── chat/
│   └── services/
│       └── actions/
│           ├── update-chat-title/
│           │   └── update-chat-title.ts
│           ├── delete-user-chat-by-id/
│           │   └── delete-user-chat-by-id.ts
│           └── ...
└── user/
    └── services/
        └── actions/
            ├── update-user-name/
            │   └── update-user-name.ts
            └── ...
```

Each action is in its own directory with a single file, following the pattern: `[action-name]/[action-name].ts`

## Creating Server Actions

### Basic Structure

Always start with the `"use server"` directive at the top of the file:

```typescript
"use server";

import { assertSessionExists } from "@/features/auth/lib/asserts";
import { auth } from "@/features/auth/services/auth";

import { api } from "@/lib/api-response";
import { handleApiError } from "@/lib/utils/handle-api-error";

export async function myServerAction({ param }: { param: string }) {
    try {
        // Action logic
        return api.success(...);
    } catch (error) {
        return handleApiError(error, () => api.error(...));
    }
}
```

### Authentication

Always check authentication first:

```typescript
export async function updateUserName({ newName }: WithNewName) {
    try {
        const session = await auth();
        assertSessionExists(session);

        // Now you can safely use session.user.id
        const userId = session.user.id;
        // ...
    } catch (error) {
        return handleApiError(error, () => api.error.user.updateName(error));
    }
}
```

### Validation

Use assertion functions for validation:

```typescript
import {
    assertIsChatTitle,
    assertIsDBChatId,
} from "@/features/chat/lib/asserts";

export async function updateChatTitle({
    chatId,
    newTitle,
}: WithNewTitle & WithChatId) {
    try {
        const session = await auth();
        assertSessionExists(session);
        assertIsChatTitle(newTitle);
        assertIsDBChatId(chatId);

        // Validation passed, proceed
    } catch (error) {
        // ...
    }
}
```

For complex validation, use Zod schemas:

```typescript
import { signupSchema } from "@/features/auth/lib/schemas";

export async function signUp(data: SignUpData) {
    try {
        const validatedData = signupSchema.safeParse(data);

        if (!validatedData.success) {
            return api.error.auth.validation(validatedData.error);
        }

        const { email, name, password } = validatedData.data;
        // ... sign up logic
        return api.success.auth.signup(null);
    } catch (error) {
        return handleApiError(error, () => api.error.auth.signup(error));
    }
}
```

### Response Pattern

Always use the API response utilities. Server actions return the response object directly (no `.toResponse()` needed):

```typescript
import { api } from "@/lib/api-response";
import { PLURAL } from "@/lib/constants";

// Success responses - return response object directly
return api.success.chat.rename(chatId);
return api.success.chat.delete(chatId, { count: PLURAL.SINGLE });
return api.success.user.updateName(user.name);
return api.success.auth.signin(null);

// Error responses - return response object directly
return api.error.chat.rename(error);
return api.error.chat.delete(error, { count: PLURAL.SINGLE });
return api.error.user.updateName(error);
return api.error.auth.validation(error);
```

**Note**: Server actions return the response object directly. API routes need to call `.toResponse()` to convert to a `Response` instance.

### Error Handling

Wrap actions in try-catch and use `handleApiError`:

```typescript
import { PLURAL } from "@/lib/constants";
import { handleApiError } from "@/lib/utils/handle-api-error";

export async function deleteUserChatById({ chatId }: WithChatId) {
    try {
        const session = await auth();
        assertSessionExists(session);
        // ... action logic

        return api.success.chat.delete(chatId, { count: PLURAL.SINGLE });
    } catch (error) {
        return handleApiError(error, () =>
            api.error.chat.delete(error, { count: PLURAL.SINGLE }),
        );
    }
}
```

## Authorization

Check authorization after authentication:

```typescript
import { isUserChatOwner } from "./db";

export async function deleteUserChatById({ chatId }: WithChatId) {
    try {
        const session = await auth();
        assertSessionExists(session);

        const isOwner = await isUserChatOwner({
            chatId,
            userId: session.user.id,
        });

        if (!isOwner) {
            return api.error.session.authorization();
        }

        // User is authorized, proceed
    } catch (error) {
        // ...
    }
}
```

## Cache Tag Updates

When mutating data, update relevant cache tags to invalidate cached data:

```typescript
import { updateTag } from "next/cache";

import { tag } from "@/lib/cache-tag";

export async function updateChatTitle({
    chatId,
    newTitle,
}: WithNewTitle & WithChatId) {
    try {
        const session = await auth();
        assertSessionExists(session);
        const userId = session.user.id;

        // ... update logic

        // Update cache tags to invalidate related cached data
        updateTag(tag.userChats(userId));
        updateTag(tag.userChat(chatId));
        updateTag(tag.userSharedChats(userId));

        return api.success.chat.rename(chatId);
    } catch (error) {
        return handleApiError(error, () => api.error.chat.rename(error));
    }
}
```

## Parameter Patterns

### Object Parameters

Always use object parameters for better type safety and extensibility:

```typescript
// ✅ Good
export async function updateChatTitle({
    chatId,
    newTitle,
}: WithNewTitle & WithChatId) {
    // ...
}

// ❌ Bad
export async function updateChatTitle(chatId: string, newTitle: string) {
    // ...
}
```

### Type Utilities

Use type utilities from feature types for consistent parameter shapes:

```typescript
import type {
    WithChatId,
    WithChatIds,
    WithChatMessageId,
    WithNewTitle,
    WithVisibility,
} from "@/features/chat/lib/types";

// Combine multiple type utilities
export async function updateChatTitle({
    chatId,
    newTitle,
}: WithNewTitle & WithChatId) {
    // ...
}
```

## Calling Server Actions

### From Client Components

Server actions can be called directly from Client Components:

```typescript
"use client";

import { updateChatTitle } from "@/features/chat/services/actions";
import { toast } from "sonner";

export function ChatTitleEditor({ chatId }: { chatId: string }) {
    async function handleUpdateTitle(newTitle: string) {
        const response = await updateChatTitle({
            chatId,
            newTitle,
        });

        if (!response.success) {
            toast.error(response.message);
            return;
        }

        toast.success(response.message);
    }

    return (
        // ...
    );
}
```

### Optimistic Updates

Use `useOptimistic` and `startTransition` for optimistic updates:

```typescript
"use client";

import { useOptimistic, startTransition } from "react";
import { upvoteChatMessage } from "@/features/chat/services/actions";
import { toast } from "sonner";

export function ChatMessageVotes({ messageId, chatId, isUpvoted }: Props) {
    const [optimisticIsUpvoted, setOptimisticIsUpvoted] =
        useOptimistic(isUpvoted);

    async function handleUpvote() {
        startTransition(async () => {
            setOptimisticIsUpvoted(!isUpvoted);

            const response = await upvoteChatMessage({
                messageId,
                chatId,
                upvote: !isUpvoted,
            });

            if (!response.success) {
                toast.error(response.message);
                // Revert optimistic update if needed
                setOptimisticIsUpvoted(isUpvoted);
            }
        });
    }

    return (
        // ...
    );
}
```

### With Forms

Use server actions with React Hook Form:

```typescript
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signInWithCredentials } from "@/features/auth/services/actions";
import { signinSchema } from "@/features/auth/lib/schemas";
import { toast } from "sonner";

export function SignInForm() {
    const form = useForm<z.infer<typeof signinSchema>>({
        resolver: zodResolver(signinSchema),
    });

    async function handleSubmit(values: z.infer<typeof signinSchema>) {
        const response = await signInWithCredentials({
            email: values.email,
            password: values.password,
        });

        if (!response.success) {
            toast.error(response.message);
            return;
        }

        toast.success(response.message);
        router.push("/");
    }

    return (
        <form onSubmit={form.handleSubmit(handleSubmit)}>
            {/* ... */}
        </form>
    );
}
```

## File Uploads

Handle file uploads with FormData:

```typescript
export async function uploadUserFiles({
    files,
    chatId,
}: WithFiles & WithChatId) {
    try {
        const session = await auth();
        assertSessionExists(session);

        // Validate files
        const result = await chatFileListUploadSchema.safeParseAsync(
            Array.from(files),
        );

        if (!result.success) {
            return api.error.file.uploadMany(
                { message: result.error.errors.map(e => e.message).join("\n") },
                { count: files.length },
            );
        }

        // Process files in parallel
        const uploadPromises = files.map(file =>
            storeUserFile({
                file,
                chatId,
                userId: session.user.id,
            }),
        );

        const uploadedFiles = await Promise.all(uploadPromises);

        return api.success.file.uploadMany(uploadedFiles, {
            count: files.length,
        });
    } catch (error) {
        return handleApiError(error, () =>
            api.error.file.uploadMany(error, { count: files.length }),
        );
    }
}
```

## Batch Operations

For batch operations, process items in parallel when possible:

```typescript
export async function deleteUserFiles({
    storedFiles,
    chatId,
}: WithStoredUploadedFiles & WithChatId) {
    try {
        const session = await auth();
        assertSessionExists(session);

        const data = await Promise.all(
            storedFiles.map(file =>
                _deleteUserFile({
                    chatId,
                    storedFile: file,
                    userId: session.user.id,
                }),
            ),
        );

        return api.success.file.deleteMany(data, {
            count: storedFiles.length,
        });
    } catch (error) {
        return handleApiError(error, () =>
            api.error.file.deleteMany(error, {
                count: storedFiles.length,
            }),
        );
    }
}
```

## Naming Conventions

- Use verb-noun pattern: `updateUserName`, `deleteUserChatById`
- Be specific: `upvoteChatMessage` not `voteMessage`
- Use camelCase
- Export all actions as named exports

## Type Safety

Always type parameters and return values explicitly:

```typescript
import type { WithChatId, WithNewTitle } from "@/features/chat/lib/types";

import type { ApiResponse } from "@/lib/api-response";

export async function updateChatTitle({
    chatId,
    newTitle,
}: WithNewTitle & WithChatId): Promise<ApiResponse<string>> {
    // TypeScript knows the parameter types
    // Return type is ApiResponse<TData> where TData is the data type
    // Return type can be inferred from api.success/error
}
```

## When to Use Server Actions vs API Routes

### Use Server Actions For:

- ✅ Form submissions
- ✅ Mutations from Client Components
- ✅ Simple CRUD operations
- ✅ Operations that don't need streaming
- ✅ Operations that don't need custom HTTP headers

### Use API Routes For:

- ✅ Streaming responses (SSE, Server-Sent Events)
- ✅ Webhooks
- ✅ Complex request handling
- ✅ When you need specific HTTP methods/status codes
- ✅ External API integrations that require custom headers

## Best Practices

1. **Always validate input** - Use assertion functions or Zod schemas
2. **Always authenticate** - Check session at the start
3. **Handle errors gracefully** - Use `handleApiError` utility
4. **Return structured responses** - Use API response utilities
5. **Use type utilities** - Combine type utilities for parameters
6. **Batch operations** - Process items in parallel when possible
7. **Check authorization** - Verify user permissions before mutations
8. **Log errors** - Include context in error logs
9. **Keep actions focused** - One responsibility per action
10. **Reuse database services** - Don't duplicate database logic in actions

## Server Actions vs Database Services

- **Server Actions** (`services/actions/[action-name]/[action-name].ts`): Handle business logic, validation, authentication, authorization, and return API responses. These are called from Client Components.
- **Database Services** (`services/db/[operation-name]/[operation-name].ts`): Handle raw database operations. These can be called from Server Actions, API routes, or Server Components.

# Feature Structure Guidelines

## Feature Organization

Each feature is self-contained with the following structure:

```
features/[feature-name]/
├── components/          # Feature-specific React components
│   └── [component-name]/
│       ├── [component-name].tsx
│       ├── [component-name]-[variant].tsx  # Sub-components
│       └── index.ts
├── hooks/              # Feature-specific React hooks
├── lib/                # Feature utilities and configuration
│   ├── asserts.ts      # Type assertion functions
│   ├── constants/      # Feature constants
│   ├── schemas.ts      # Zod validation schemas
│   ├── types.ts        # TypeScript type definitions
│   └── utils/          # Utility functions
├── providers/          # React context providers
└── services/           # External integrations
    ├── actions/        # Server actions
    │   └── [action-name]/
    │       ├── [action-name].ts
    │       └── index.ts
    ├── ai/             # AI-related services
    │   └── [operation-name]/
    │       ├── [operation-name].ts
    │       └── index.ts
    ├── api/            # API service wrappers
    │   └── [operation-name]/
    │       ├── [operation-name].ts
    │       └── index.ts
    ├── db/             # Database operations
    │   └── [operation-name]/
    │       ├── [operation-name].ts
    │       └── index.ts
    └── storage/        # Storage operations (if needed)
        └── [operation-name]/
            ├── [operation-name].ts
            └── index.ts
```

## Feature Isolation

### Principles

1. **Encapsulation**: Features should contain all code needed for their functionality
2. **Minimal Dependencies**: Only depend on shared code (`@/lib`, `@/components/ui`)
3. **Well-Defined Interfaces**: Features expose clear APIs for other features
4. **No Circular Dependencies**: Features cannot depend on each other directly

### Shared vs Feature-Specific

**Feature-Specific** (in feature directory):

- Components only used by this feature
- Hooks specific to this feature
- Business logic and types
- Database queries for this feature

**Shared** (in `src/lib/` or `src/components/ui/`):

- Utilities used by multiple features
- UI components used across features
- Common types and constants
- Shared validation schemas

## Feature Examples

### Auth Feature

```
features/auth/
├── components/
│   ├── signin-form.tsx
│   └── signup-form.tsx
├── lib/
│   ├── asserts.ts              # assertSessionExists, etc.
│   ├── constants.ts            # AUTH_PROVIDER constants
│   ├── schemas.ts              # signinSchema, signupSchema
│   ├── types.ts                # Auth-specific types
│   └── utils/
│       └── compare-password.ts
├── providers/
│   └── auth-provider.tsx
└── services/
    └── auth.ts                 # NextAuth configuration
```

### Chat Feature

```
features/chat/
├── components/
│   ├── chat-message/
│   │   ├── chat-message.tsx
│   │   ├── chat-message-assistant.tsx
│   │   ├── chat-message-user.tsx
│   │   └── index.ts
│   └── chat-sidebar/
│       ├── chat-sidebar.tsx
│       └── index.ts
├── hooks/
│   └── use-chat.ts
├── lib/
│   ├── ai/
│   │   ├── system-messages/
│   │   ├── tools/
│   │   └── instructions/
│   ├── asserts.ts
│   ├── constants/
│   ├── schemas.ts
│   ├── types.ts
│   └── utils/
├── providers/
│   └── chat-provider.tsx
└── services/
    ├── actions/
    │   ├── update-chat-title/
    │   │   ├── update-chat-title.ts
    │   │   └── index.ts
    │   └── ...
    ├── ai/
    │   ├── generate-chat-title/
    │   │   ├── generate-chat-title.ts
    │   │   └── index.ts
    │   └── ...
    ├── db/
    │   ├── get-user-chat-by-id/
    │   │   ├── get-user-chat-by-id.ts
    │   │   └── index.ts
    │   └── ...
    └── storage/
        └── ...
```

## File Naming Conventions

### Feature Files

- **Components**: Directory structure `[component-name]/[component-name].tsx` (e.g., `chat-message/chat-message.tsx`)
- **Services**: Directory structure `[service-type]/[operation-name]/[operation-name].ts` (e.g., `db/get-user-chat-by-id/get-user-chat-by-id.ts`)
- **Actions**: Directory structure `actions/[action-name]/[action-name].ts` (e.g., `actions/update-chat-title/update-chat-title.ts`)
- **Utils**: `kebab-case.ts` (e.g., `format-date.ts`)
- **Types**: `types.ts` or directory with files (e.g., `types/db.ts`, `types/ui.ts`)
- **Constants**: `constants.ts` or directory with files

### Export Patterns

Use index files for clean exports:

```typescript
// Then import as:
import type { Chat, ChatMessage } from "@/features/chat/lib/types";

// features/chat/lib/types/index.ts
export type { ChatMessage } from "./chat-message";
export type { Chat } from "./chat";
```

## Services Layer

Services handle external integrations. Each service operation is in its own directory:

### Service Organization

Each service operation follows this structure:

```
services/[service-type]/[operation-name]/
├── [operation-name].ts      # Implementation
├── [operation-name].test.ts  # Unit tests
├── [operation-name].spec.ts  # Integration tests
├── [operation-name].mock.ts  # Mock implementations
└── index.ts                  # Exports
```

### Database Services (`services/db/[operation-name]/[operation-name].ts`)

- All Supabase queries go here
- Functions are async and return typed data
- Use object parameters (not positional)
- Handle errors and null cases
- Use feature-specific types
- Use `"use server"` directive
- Use `"use cache"` directive for cached functions
- Use `cacheTag()` for cache tagging

```typescript
// features/chat/services/db/get-user-chat-by-id/get-user-chat-by-id.ts
"use server";

import { cacheTag } from "next/cache";

import type { DBChatId, WithChatId } from "@/features/chat/lib/types";

import type { WithUserId } from "@/features/user/lib/types";

import { tag } from "@/lib/cache-tag";

import { supabase } from "@/services/supabase";

// features/chat/services/db/get-user-chat-by-id/get-user-chat-by-id.ts

// features/chat/services/db/get-user-chat-by-id/get-user-chat-by-id.ts

type GetUserChatByIdProps = WithChatId & WithUserId;

export async function getUserChatById({
    chatId,
    userId,
}: GetUserChatByIdProps) {
    "use cache";
    cacheTag(tag.userChat(chatId));

    return uncachedGetUserChatById({ chatId, userId });
}

export async function uncachedGetUserChatById({
    chatId,
    userId,
}: GetUserChatByIdProps) {
    const { data, error } = await supabase
        .from("chats")
        .select("*")
        .eq("id", chatId)
        .eq("userId", userId)
        .maybeSingle();

    if (error) throw new Error("Failed to fetch user chat");
    return data;
}
```

**Pattern**: Provide both cached (`getUserChatById`) and uncached (`uncachedGetUserChatById`) versions. The cached version uses `"use cache"` and `cacheTag()`.

### AI Services (`services/ai/[operation-name]/[operation-name].ts`)

- AI-related operations
- Prompt building
- Model interactions

```typescript
// features/chat/services/ai/generate-chat-title/generate-chat-title.ts
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

import type { UIChatMessage } from "@/features/chat/lib/types";

export async function generateChatTitle(messages: UIChatMessage[]) {
    const result = await generateText({
        model: openai("gpt-4o"),
        messages: convertToModelMessages(messages),
        // ... AI logic
    });

    return result.text.trim();
}
```

### API Services (`services/api/[operation-name]/[operation-name].ts`)

- API route service wrappers
- Used by Server Components to fetch data
- Can use React Query on the client side

### Storage Services (`services/storage/[operation-name]/[operation-name].ts`)

- File storage operations
- Supabase Storage interactions
- File upload/download operations

## Types

### Type Naming

Prefix types based on their context:

- `DB*`: Database types (e.g., `DBChatId`, `DBUser`)
- `UI*`: UI-specific types (e.g., `UIChatMessage`)
- `API*`: API-specific types (e.g., `APIChatResponse`)
- Plain names: General domain types (e.g., `Chat`, `User`)

### Type Location

- Feature-specific: `features/[feature]/lib/types.ts`
- Shared types: `src/lib/types/[domain].ts`

## Constants

### Organization

- Feature constants: `features/[feature]/lib/constants/`
- Use const objects with `as const`:

```typescript
export const CHAT_ROLE = {
    USER: "user",
    ASSISTANT: "assistant",
    SYSTEM: "system",
} as const;

export type ChatRole = (typeof CHAT_ROLE)[keyof typeof CHAT_ROLE];
```

## Assertions

Create type assertion functions for validation:

```typescript
// features/chat/lib/asserts.ts
import { z } from "zod";

const chatRequestBodySchema = z.object({
    message: z.string().min(1),
    chatId: z.string().optional(),
});

export function assertIsChatRequestBodyValid(
    body: unknown,
): asserts body is z.infer<typeof chatRequestBodySchema> {
    const result = chatRequestBodySchema.safeParse(body);
    if (!result.success) {
        throw new Error(`Invalid request body: ${result.error.message}`);
    }
}
```

## Hooks

Feature-specific hooks encapsulate feature logic:

```typescript
// features/chat/hooks/use-chat.ts
export function useChat({ chatId, userId }: UseChatProps) {
    // Feature-specific hook logic
    return {
        messages,
        sendMessage,
        isLoading,
    };
}
```

## Providers

Feature providers wrap feature context:

```typescript
// features/chat/providers/chat-provider.tsx
"use client";

export function ChatProvider({ children, chatId }: ChatProviderProps) {
  // Feature context logic
  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}
```

## Testing Feature Boundaries

When adding new code, ask:

1. Is this used by multiple features? → Move to shared
2. Is this only used by one feature? → Keep in feature
3. Is this a UI component used across features? → `components/ui/`
4. Is this a feature-specific component? → `features/[feature]/components/`

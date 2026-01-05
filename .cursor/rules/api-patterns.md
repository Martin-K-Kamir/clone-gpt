# API Route Patterns

## Route File Structure

API routes live in `src/app/*/api/[route-name]/route.ts`:

```
src/app/
├── (auth)/api/auth/route.ts
├── (chat)/api/chat/route.ts
└── (user)/api/user/route.ts
```

## Route Handlers

Export named functions for HTTP methods:

```typescript
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    // Handle GET request
}

export async function POST(request: NextRequest) {
    // Handle POST request
}

// For dynamic routes, params is a Promise in Next.js 16+
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ chatId: string }> },
) {
    const { chatId } = await params;
    // Use chatId
}
```

**Route Configuration**:

- `preferredRegion`: Specify the deployment region (e.g., `"fra1"` for Frankfurt)
- `maxDuration`: Optional, set for long-running operations (default is 10s, max is 280s for Hobby plan)

**Note**: In Next.js 16+, `params` in dynamic routes is a Promise and must be awaited.

## Request Validation

Always validate request bodies with Zod schemas:

```typescript
import { z } from "zod";

const requestSchema = z.object({
    email: z.string().email(),
    message: z.string().min(1),
});

export async function POST(request: NextRequest) {
    const body = await request.json();

    // Validate
    const result = requestSchema.safeParse(body);
    if (!result.success) {
        return api.error.auth.validation(result.error).toResponse();
    }

    const { email, message } = result.data;
    // ...
}
```

Use assertion functions for validation when available:

```typescript
import { assertIsChatRequestBodyValid } from "@/features/chat/lib/asserts";

export async function POST(request: NextRequest) {
    const body = await request.json();
    assertIsChatRequestBodyValid(body);
    // TypeScript now knows body is valid
}
```

## Authentication

Always check authentication:

```typescript
import { assertSessionExists } from "@/features/auth/lib/asserts";
import { auth } from "@/features/auth/services/auth";

export async function POST(request: NextRequest) {
    const session = await auth();
    assertSessionExists(session);

    // Now you can safely access session.user.id
    const userId = session.user.id;
}
```

Use Promise.all for parallel operations:

```typescript
const [requestBody, session] = await Promise.all([request.json(), auth()]);
assertSessionExists(session);
```

## Response Patterns

Use the API response utilities from `@/lib/api-response`:

```typescript
import { api } from "@/lib/api-response";
import { PLURAL } from "@/lib/constants";

// Success responses - use feature-specific methods
return api.success.chat.get(data, { count: PLURAL.SINGLE }).toResponse();
return api.success.user.get(user).toResponse();
return api.success.chat.create(chatId).toResponse();

// Error responses - use feature-specific methods
return api.error.chat.notFound().toResponse();
return api.error.user.get(error).toResponse();
return api.error.chat.delete(error, { count: PLURAL.SINGLE }).toResponse();
```

**Important**: Always call `.toResponse()` at the end to convert the response object to a `Response` instance for API routes.

## Error Handling

Always wrap route handlers in try-catch:

```typescript
import { PLURAL } from "@/lib/constants";
import { handleApiErrorResponse } from "@/lib/utils/handle-api-error";

export async function POST(request: NextRequest) {
    try {
        // Route logic
        return api.success.chat
            .get(result, { count: PLURAL.SINGLE })
            .toResponse();
    } catch (error) {
        console.error("[route-name] error:", error);
        return handleApiErrorResponse(error, () =>
            api.error.chat.get(error, { count: PLURAL.SINGLE }).toResponse(),
        );
    }
}
```

## Logging

Use prefixed console logs for debugging:

```typescript
console.log("[chat] request body:", requestBody);
console.log("[chat] session:", session);
console.error("[chat] rate limit error:", rateLimitError);
```

The prefix should match the route/feature name.

## Database Access

- Use feature-specific database services from `features/[feature]/services/db`
- Don't access Supabase directly in route handlers
- Always handle errors and null cases

```typescript
import { getUserChatById } from "@/features/chat/services/db";

const chat = await getUserChatById({ chatId, userId });
if (!chat) {
  return api.error.chat.notFound().toResponse();
}
```

## Type Safety

Use feature-specific types:

```typescript
import type {
    DBChatId,
    DBUserId,
    UIChatMessage,
} from "@/features/chat/lib/types";

function createChatMessage(
    chatId: DBChatId,
    userId: DBUserId,
    message: UIChatMessage,
) {
    // ...
}
```

## Common Patterns

### Pagination

```typescript
const searchParams = request.nextUrl.searchParams;
const page = Number(searchParams.get("page")) || 1;
const limit = Number(searchParams.get("limit")) || 10;

const { data, total } = await getPaginatedData({ page, limit });
```

### Query Parameters

```typescript
import { parseQueryParams } from "@/lib/utils/parse-query-params";

const { page, limit, search } = parseQueryParams(request, {
    page: z.number().default(1),
    limit: z.number().default(10),
    search: z.string().optional(),
});
```

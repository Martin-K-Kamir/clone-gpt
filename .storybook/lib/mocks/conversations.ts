import type {
    DBChatMessageId,
    UIChatMessage,
} from "../../../src/features/chat/lib/types";
import {
    MOCK_ASSISTANT_MESSAGE_WITH_GENERATED_FILE,
    MOCK_ASSISTANT_MESSAGE_WITH_GENERATED_FILES,
    MOCK_ASSISTANT_MESSAGE_WITH_GENERATED_IMAGE,
    MOCK_ASSISTANT_MESSAGE_WITH_GENERATED_IMAGES,
    MOCK_ASSISTANT_MESSAGE_WITH_GENERATED_IMAGE_LANDSCAPE,
    MOCK_ASSISTANT_MESSAGE_WITH_GENERATED_IMAGE_PORTRAIT,
    MOCK_ASSISTANT_MESSAGE_WITH_IMAGE_ANALYSIS,
    MOCK_ASSISTANT_MESSAGE_WITH_MARKDOWN,
    MOCK_ASSISTANT_MESSAGE_WITH_REFERENCE_IMAGE,
    MOCK_ASSISTANT_MESSAGE_WITH_WEATHER,
    createMockAssistantMessage,
    createMockFileMessagePart,
    createMockImageMessagePart,
    createMockUserMessage,
    createMockUserMessageWithFiles,
} from "./messages";
import { MOCK_ASSISTANT_MESSAGE_ID, MOCK_MESSAGE_ID } from "./messages";

export const MOCK_CONVERSATION_SIMPLE: UIChatMessage[] = [
    createMockUserMessage({
        text: "Hello, how can you help me?",
    }),
    createMockAssistantMessage({
        text: "Hello! I'm here to help you. How can I assist you today?",
    }),
];

export const MOCK_CONVERSATION_MULTIPLE: UIChatMessage[] = [
    createMockUserMessage({ text: "What is React?" }),
    createMockAssistantMessage({
        text: "React is a JavaScript library for building user interfaces.",
    }),
    createMockUserMessage({
        text: "How does it work?",
        messageId: `${MOCK_MESSAGE_ID}-1` as DBChatMessageId,
    }),
    createMockAssistantMessage({
        text: "React uses a virtual DOM to efficiently update the UI.",
        messageId: `${MOCK_ASSISTANT_MESSAGE_ID}-1` as DBChatMessageId,
    }),
    createMockUserMessage({
        text: "Can you give me an example?",
        messageId: `${MOCK_MESSAGE_ID}-2` as DBChatMessageId,
    }),
    createMockAssistantMessage({
        text: "Sure! Here's a simple React component example...",
        messageId: `${MOCK_ASSISTANT_MESSAGE_ID}-2` as DBChatMessageId,
    }),
];

export const MOCK_CONVERSATION_WITH_SINGLE_IMAGE: UIChatMessage[] = [
    createMockUserMessageWithFiles({
        text: "Check out this image:",
        files: [
            createMockImageMessagePart({
                name: "photo.jpg",
                url: "https://picsum.photos/id/239/800/600",
            }),
        ],
    }),
    createMockAssistantMessage({
        text: "That's a beautiful image! I can see it clearly.",
    }),
];

export const MOCK_CONVERSATION_WITH_SINGLE_FILE: UIChatMessage[] = [
    createMockUserMessageWithFiles({
        text: "Here's a document:",
        files: [
            createMockFileMessagePart({
                name: "document.pdf",
                url: "https://example.com/document.pdf",
                size: 1024 * 500,
            }),
        ],
    }),
    createMockAssistantMessage({
        text: "I've received your document. Let me analyze it for you.",
    }),
];

export const MOCK_CONVERSATION_WITH_MULTIPLE_FILES: UIChatMessage[] = [
    createMockUserMessageWithFiles({
        text: "Here are some documents:",
        files: [
            createMockFileMessagePart({
                name: "document1.pdf",
                url: "https://example.com/document1.pdf",
                size: 1024 * 500,
            }),
            createMockFileMessagePart({
                name: "document2.pdf",
                url: "https://example.com/document2.pdf",
                size: 1024 * 600,
            }),
            createMockFileMessagePart({
                name: "notes.txt",
                url: "https://example.com/notes.txt",
                extension: "txt",
                size: 1024 * 10,
            }),
        ],
    }),
    createMockAssistantMessage({
        text: "I've received all your documents. Let me review them.",
    }),
];

export const MOCK_CONVERSATION_WITH_WEATHER: UIChatMessage[] = [
    createMockUserMessage({ text: "What's the weather in New York?" }),
    MOCK_ASSISTANT_MESSAGE_WITH_WEATHER,
];

export const MOCK_CONVERSATION_WITH_MULTIPLE_IMAGES: UIChatMessage[] = [
    createMockUserMessageWithFiles({
        text: "Here are some photos:",
        files: [
            createMockImageMessagePart({
                name: "photo1.jpg",
                url: "https://picsum.photos/id/239/800/600",
            }),
            createMockImageMessagePart({
                name: "photo2.jpg",
                url: "https://picsum.photos/id/240/800/600",
            }),
            createMockImageMessagePart({
                name: "photo3.jpg",
                url: "https://picsum.photos/id/241/800/600",
            }),
        ],
    }),
    createMockAssistantMessage({
        text: "I can see all three images. They look great!",
    }),
];

export const MOCK_CONVERSATION_WITH_IMAGE_ANALYSIS: UIChatMessage[] = [
    createMockUserMessageWithFiles({
        text: "Analyze this image:",
        files: [
            createMockImageMessagePart({
                name: "chart.png",
                url: "https://picsum.photos/id/239/800/600",
            }),
        ],
    }),
    MOCK_ASSISTANT_MESSAGE_WITH_IMAGE_ANALYSIS,
];

export const MOCK_CONVERSATION_COMPLEX: UIChatMessage[] = [
    createMockUserMessage({ text: "What's the weather in New York?" }),
    MOCK_ASSISTANT_MESSAGE_WITH_WEATHER,
    createMockUserMessageWithFiles({
        text: "Generate an image based on this:",
        files: [
            createMockImageMessagePart({
                name: "reference.jpg",
                url: "https://picsum.photos/id/1015/800/600",
            }),
        ],
        messageId: `${MOCK_MESSAGE_ID}-1` as DBChatMessageId,
    }),
    MOCK_ASSISTANT_MESSAGE_WITH_REFERENCE_IMAGE,
];

export const MOCK_CONVERSATION_WITH_GENERATED_IMAGE: UIChatMessage[] = [
    createMockUserMessage({ text: "Generate an image of a sunset" }),
    MOCK_ASSISTANT_MESSAGE_WITH_GENERATED_IMAGE,
];

export const MOCK_CONVERSATION_WITH_GENERATED_IMAGE_PORTRAIT: UIChatMessage[] =
    [
        createMockUserMessage({ text: "Generate a portrait image" }),
        MOCK_ASSISTANT_MESSAGE_WITH_GENERATED_IMAGE_PORTRAIT,
    ];

export const MOCK_CONVERSATION_WITH_GENERATED_IMAGE_LANDSCAPE: UIChatMessage[] =
    [
        createMockUserMessage({ text: "Generate a landscape image" }),
        MOCK_ASSISTANT_MESSAGE_WITH_GENERATED_IMAGE_LANDSCAPE,
    ];

export const MOCK_CONVERSATION_WITH_GENERATED_IMAGES: UIChatMessage[] = [
    createMockUserMessage({ text: "Generate some images for me" }),
    MOCK_ASSISTANT_MESSAGE_WITH_GENERATED_IMAGES,
];

export const MOCK_CONVERSATION_WITH_GENERATED_FILE: UIChatMessage[] = [
    createMockUserMessage({ text: "Create a Python script for me" }),
    MOCK_ASSISTANT_MESSAGE_WITH_GENERATED_FILE,
];

export const MOCK_CONVERSATION_WITH_GENERATED_FILES: UIChatMessage[] = [
    createMockUserMessage({ text: "Create some files for me" }),
    MOCK_ASSISTANT_MESSAGE_WITH_GENERATED_FILES,
];

export const MOCK_CONVERSATION_WITH_MARKDOWN: UIChatMessage[] = [
    createMockUserMessage({ text: "Explain React hooks with examples" }),
    MOCK_ASSISTANT_MESSAGE_WITH_MARKDOWN,
];

export const MOCK_CONVERSATION_WITH_LONG_MESSAGES: UIChatMessage[] = [
    createMockUserMessage({
        text: `I'm working on a complex web application using Next.js and React, and I need help understanding the best practices for state management, data fetching, and component architecture. The application needs to handle real-time updates, user authentication, file uploads, and complex form validations. Can you provide a comprehensive guide on how to structure this application?`,
        messageId: `${MOCK_MESSAGE_ID}-0` as DBChatMessageId,
    }),
    createMockAssistantMessage({
        text: `I'd be happy to help you build a robust Next.js application! Let me break down the best practices for each area you mentioned:

## State Management

For Next.js applications, I recommend a hybrid approach:
- **Server State**: Use React Query (TanStack Query) for server state management. It provides excellent caching, background updates, and synchronization.
- **Client State**: Use React Context or Zustand for simple global state, or React Query's client state for more complex scenarios.
- **Form State**: Use React Hook Form for form management - it's performant and integrates well with validation libraries like Zod.

## Data Fetching

Next.js 13+ App Router provides excellent data fetching patterns:
- **Server Components**: Fetch data directly in Server Components for better performance and SEO.
- **Server Actions**: Use Server Actions for mutations (create, update, delete operations).
- **API Routes**: Create API routes for external API integrations or when you need custom endpoints.

## Component Architecture

Organize your components by feature:
\`\`\`
app/
  (routes)/
  components/
    feature-name/
      components/
      hooks/
      lib/
      types/
\`\`\`

This keeps related code together and makes the codebase more maintainable.`,
        messageId: `${MOCK_ASSISTANT_MESSAGE_ID}-0` as DBChatMessageId,
    }),
    createMockUserMessage({
        text: `That's very helpful! Now, regarding real-time updates - I need to implement a chat feature where users can see messages in real-time. What's the best approach for this in Next.js? Should I use WebSockets, Server-Sent Events, or polling? Also, how do I handle authentication securely in this context?`,
        messageId: `${MOCK_MESSAGE_ID}-1` as DBChatMessageId,
    }),
    createMockAssistantMessage({
        text: `Great question! For real-time chat in Next.js, here's my recommendation:

## Real-Time Communication

**WebSockets** are the best choice for bidirectional real-time communication:
- Use a library like **Socket.io** or native WebSocket API
- For production, consider services like **Pusher**, **Ably**, or **Supabase Realtime**
- These services handle scaling, reconnection, and message delivery guarantees

**Implementation Pattern:**
1. Create a WebSocket provider context that manages the connection
2. Use React Query's real-time subscriptions or custom hooks
3. Implement optimistic updates for better UX
4. Handle reconnection logic and offline states

## Authentication Security

For secure authentication in Next.js:
- Use **NextAuth.js** (Auth.js) for authentication - it's the standard for Next.js
- Implement JWT tokens with secure httpOnly cookies
- Use middleware to protect routes
- Validate tokens on both client and server
- For WebSocket connections, authenticate during the handshake and validate on each message

**Security Best Practices:**
- Never expose sensitive data in client components
- Always validate user permissions on the server
- Use CSRF tokens for state-changing operations
- Implement rate limiting to prevent abuse
- Use HTTPS in production (Next.js enforces this)

Would you like me to show you a complete implementation example for the chat feature with authentication?`,
        messageId: `${MOCK_ASSISTANT_MESSAGE_ID}-1` as DBChatMessageId,
    }),
];

export const MOCK_CONVERSATION_BASIC: UIChatMessage[] = [
    createMockUserMessage({ text: "Hello, how are you?" }),
    createMockAssistantMessage({ text: "I'm doing well, thank you!" }),
];

export const MOCK_CONVERSATION_PUBLIC: UIChatMessage[] = [
    createMockUserMessage({ text: "Hello everyone!" }),
    createMockAssistantMessage({ text: "Hello! How can I help?" }),
];

export const MOCK_CONVERSATION_LONG_SCROLLING: UIChatMessage[] = Array.from(
    { length: 10 },
    (_, i) => {
        const messageId =
            `${i.toString().padStart(8, "0")}-0000-0000-0000-000000000002` as DBChatMessageId;
        const assistantMessageId =
            `${i.toString().padStart(8, "0")}-0000-0000-0000-000000000003` as DBChatMessageId;

        if (i % 2 === 0) {
            return createMockUserMessage({
                text: `User message ${i + 1}: This is a longer message to test scrolling behavior. `.repeat(
                    5,
                ),
                messageId,
            });
        }
        return createMockAssistantMessage({
            text: `Assistant message ${i + 1}: This is a longer response to test scrolling behavior. `.repeat(
                5,
            ),
            messageId: assistantMessageId,
        });
    },
);

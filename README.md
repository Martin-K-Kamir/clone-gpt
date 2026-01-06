# Clone GPT

A ChatGPT clone application built with Next.js 16, React 19, and OpenAI GPT-4o.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Available-brightgreen)](https://clone-gpt-mkk.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.0-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

## 🚀 Features

### Core Functionality

- **AI Chat Interface** - Real-time streaming conversations with OpenAI GPT-4o
- **File Uploads** - Upload and process files (images, documents, code files)
- **Chat History** - Persistent chat history with search functionality
- **Public/Private Chats** - Share chats publicly or keep them private
- **Chat Sharing** - Share your conversations with others via shareable links

### Advanced Features

- **Message Regeneration** - Regenerate AI responses with different variations
- **Message Voting** - Upvote or downvote messages to improve responses
- **Code Interpretation** - AI can execute and interpret code
- **File Tools** - AI can read, analyze, and process uploaded files
- **Markdown Rendering** - Rich markdown support with syntax highlighting
- **User Preferences** - Customize AI personality and characteristics per user
- **Rate Limiting** - Intelligent rate limiting for messages and file uploads
- **Geolocation Context** - AI responses consider user's geographic location

### User Experience

- **Responsive Design** - Works seamlessly on desktop and mobile
- **Real-time Streaming** - Instant AI responses with streaming text
- **Drag & Drop** - Easy file uploads via drag and drop interface
- **Search** - Search through chat history with advanced filtering
- **Accessibility** - Built with accessibility in mind using Radix UI

## 🛠️ Tech Stack

### Frontend

- **Framework**: Next.js 16.1.0
- **UI Library**: React 19.2.3
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + shadcn/ui patterns
- **State Management**: TanStack Query
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React, Tabler Icons
- **Animations**: Framer Motion

### Backend

- **Runtime**: Node.js
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth v5
- **AI SDK**: Vercel AI SDK
- **AI Model**: OpenAI GPT-4o
- **File Storage**: Supabase Storage

### Development & Testing

- **Testing**: Vitest + Testing Library
- **Component Testing**: Storybook + Chromatic
- **API Mocking**: MSW (Mock Service Worker)
- **Linting**: ESLint
- **Formatting**: Prettier
- **Type Checking**: TypeScript

## 📐 Architecture

### Feature-Based Architecture

The application follows a **feature-based architecture** where each feature is self-contained with its own components, hooks, services, and utilities.

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (chat)/            # Chat functionality routes
│   ├── (general)/         # General routes
│   └── (user)/            # User management routes
├── components/            # Shared UI components
│   └── ui/               # Reusable UI primitives
├── features/             # Feature modules
│   ├── auth/            # Authentication feature
│   ├── chat/            # Chat functionality feature
│   └── user/            # User management feature
├── hooks/                # Shared React hooks
├── lib/                  # Shared utilities and types
│   ├── api-response/    # API response utilities
│   ├── classes/         # Custom error classes
│   ├── constants/       # Shared constants
│   ├── schemas/         # Zod validation schemas
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── providers/            # React context providers
└── services/             # External service integrations
```

### Feature Structure

Each feature follows a consistent structure:

```
features/[feature-name]/
├── components/          # Feature-specific React components
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
    ├── ai/             # AI-related services
    ├── api/            # API service wrappers
    ├── db/             # Database operations
    └── storage/        # Storage operations
```

### Key Architectural Principles

1. **Encapsulation** - Features are self-contained with minimal dependencies
2. **Server Components First** - Default to Server Components, use Client Components only when needed
3. **Type Safety** - Strict TypeScript with comprehensive type definitions
4. **Separation of Concerns** - Clear separation between UI, business logic, and data access
5. **Reusability** - Shared code lives in `src/lib/` and `src/components/ui/`

## 🏗️ Project Structure

### Main Features

#### Authentication (`features/auth/`)

- User sign up, sign in, and sign out
- NextAuth v5 integration
- Session management
- Password hashing and validation

#### Chat (`features/chat/`)

- AI chat interface with streaming
- Multiple AI personalities and characteristics
- File upload and processing
- Chat history and search
- Public/private chat management
- Message actions (regenerate, vote, copy)
- Code interpretation tools
- File analysis tools

#### User (`features/user/`)

- User profile management
- Chat preferences (AI personality, characteristics)
- Rate limit management
- Shared chats management
- User settings

### Services Layer

- **Database Services** (`services/db/`) - All Supabase queries with caching
- **AI Services** (`services/ai/`) - AI operations (title generation, code interpretation)
- **API Services** (`services/api/`) - API route service wrappers
- **Storage Services** (`services/storage/`) - File storage operations
- **Server Actions** (`services/actions/`) - Server-side mutations

## 🔗 Links

- **Live Demo**: [View Live Application](https://clone-gpt-mkk.vercel.app/)
- **Storybook**: [View Storybook](https://clone-gpt-storybook-mkk.netlify.app/?path=/docs/app-auth-logout-page--docs)
- **Personal Website**: [Visit My Website](https://www.martinkamir.dev/)

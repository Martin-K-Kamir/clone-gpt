# Architecture Rules

## Project Structure

This is a **Next.js 16** application using the **App Router** with a **feature-based architecture**.

### Core Technologies

- **Framework**: Next.js 16.1.0 with Turbopack
- **Language**: TypeScript (strict mode enabled)
- **Runtime**: Node.js (API routes use `runtime = "nodejs"`)
- **UI**: React 19 with Server Components by default
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives with shadcn/ui patterns
- **Database**: Supabase (PostgreSQL)
- **Authentication**: NextAuth v5 (beta)
- **State Management**: TanStack Query (React Query)
- **AI SDK**: Vercel AI SDK (@ai-sdk/openai, @ai-sdk/react)

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages and routes
│   ├── (auth)/            # Auth route group
│   ├── (chat)/            # Chat route group
│   ├── (general)/         # General routes
│   └── (user)/            # User routes
├── components/            # Shared UI components
│   └── ui/               # Reusable UI primitives
├── features/             # Feature modules (feature-based architecture)
│   ├── auth/            # Authentication feature
│   ├── chat/            # Chat functionality feature
│   └── user/            # User management feature
├── hooks/                # Shared React hooks
├── lib/                  # Shared utilities and types
│   ├── api-response/    # API response utilities
│   ├── classes/         # Custom error classes
│   ├── constants/       # Shared constants
│   ├── schemas/         # Zod schemas
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── providers/            # React context providers
└── services/             # External service integrations
```

## Feature-Based Architecture

### Feature Structure

Each feature follows this structure:

```
features/[feature-name]/
├── components/      # Feature-specific components
├── hooks/          # Feature-specific hooks
├── lib/            # Feature utilities, constants, types
│   ├── constants/  # Feature constants
│   ├── types/      # Feature types
│   └── utils/      # Feature utilities
├── providers/      # Feature context providers
└── services/       # Feature services (DB, API, etc.)
```

### Principles

1. **Encapsulation**: Features should be self-contained with minimal dependencies on other features
2. **Shared Code**: Use `src/lib/` and `src/components/ui/` for truly shared code
3. **Feature Independence**: Features communicate through well-defined interfaces
4. **Vertical Slicing**: Related code (components, hooks, utils) lives together in the feature

## Path Aliases

- `@/*` → `./src/*` (configured in tsconfig.json)

Use path aliases for all imports:

- ✅ `import { Button } from "@/components/ui/button"`
- ❌ `import { Button } from "../../../components/ui/button"`

## Route Groups

Next.js route groups (folders with parentheses) are used to organize routes:

- `(auth)`: Authentication-related routes
- `(chat)`: Chat functionality routes
- `(general)`: General application routes
- `(user)`: User management routes

Route groups don't affect the URL structure but help organize related routes.

## Server Components by Default

- All components are Server Components by default
- Use `"use client"` directive only when needed:
    - Client-side interactivity (useState, useEffect, event handlers)
    - Browser-only APIs
    - Third-party libraries that require client-side execution

## API Routes

- Located in `src/app/*/api/` directories
- Use `route.ts` file naming convention
- Export named functions: `GET`, `POST`, `PUT`, `DELETE`, etc.
- Use `NextRequest` and `NextResponse` types
- Set runtime configuration: `export const runtime = "nodejs"`

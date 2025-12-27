import { CHAT_VISIBILITY } from "../../../src/features/chat/lib/constants";
import type { DBChat, DBChatId } from "../../../src/features/chat/lib/types";
import type { PaginatedData } from "../../../src/lib/types";
import { MOCK_USER_ID } from "./users";

const adjectives = [
    "Modern",
    "Advanced",
    "Complete",
    "Simple",
    "Quick",
    "Deep",
    "Practical",
    "Comprehensive",
    "Essential",
    "Ultimate",
    "Beginner",
    "Professional",
    "Effective",
    "Creative",
    "Powerful",
];

const verbs = [
    "Learn",
    "Build",
    "Create",
    "Master",
    "Understand",
    "Implement",
    "Design",
    "Develop",
    "Explore",
    "Optimize",
    "Deploy",
    "Test",
    "Refactor",
    "Debug",
    "Scale",
];

const nouns = [
    "React",
    "TypeScript",
    "Next.js",
    "Node.js",
    "API",
    "Database",
    "Authentication",
    "State Management",
    "Component",
    "Hook",
    "Server Actions",
    "Middleware",
    "Routing",
    "Styling",
    "Testing",
    "Performance",
    "Security",
    "Deployment",
    "CI/CD",
    "Docker",
];

export function generateChatTitle(index: number): string {
    const pattern = index % 4;
    const adjIndex = index % adjectives.length;
    const verbIndex = index % verbs.length;
    const nounIndex = index % nouns.length;

    switch (pattern) {
        case 0:
            return `${verbs[verbIndex]} ${nouns[nounIndex]}`;
        case 1:
            return `${verbs[verbIndex]} a ${adjectives[adjIndex]} ${nouns[nounIndex]}`;
        case 2:
            return `Understanding ${nouns[nounIndex]}`;
        case 3:
            return `How to ${verbs[verbIndex]} ${nouns[nounIndex]}`;
        default:
            return `${verbs[verbIndex]} ${nouns[nounIndex]}`;
    }
}

export function createMockChat(
    index: number = 0,
    overrides?: Partial<DBChat>,
): DBChat {
    const fixedDate = new Date("2025-01-01");
    fixedDate.setDate(fixedDate.getDate() - index);
    const date = fixedDate.toISOString();

    return {
        id: `chat-${index}` as DBChatId,
        userId: MOCK_USER_ID,
        title: generateChatTitle(index),
        visibility: CHAT_VISIBILITY.PUBLIC,
        createdAt: date,
        updatedAt: date,
        visibleAt: date,
        ...overrides,
    } as const;
}

export function createMockChats(
    count: number,
    overrides?: Partial<DBChat>,
): DBChat[] {
    return Array.from({ length: count }, (_, index) =>
        createMockChat(index, overrides),
    );
}

export function createMockPaginatedChats(
    length: number,
    hasNextPage: boolean = false,
    overrides?: Partial<DBChat>,
): PaginatedData<DBChat[]> {
    return {
        data: createMockChats(length, overrides),
        totalCount: length,
        hasNextPage,
        nextOffset: hasNextPage ? length : undefined,
    };
}

export function createMockPrivateChat(index: number = 0): DBChat {
    return createMockChat(index, {
        visibility: CHAT_VISIBILITY.PRIVATE,
    });
}

export function createMockPublicChat(index: number = 0): DBChat {
    return createMockChat(index, {
        visibility: CHAT_VISIBILITY.PUBLIC,
    });
}

import { CHAT_VISIBILITY } from "../../../src/features/chat/lib/constants";
import type {
    DBChat,
    DBChatId,
    DBChatSearchResult,
} from "../../../src/features/chat/lib/types";
import type { PaginatedData } from "../../../src/lib/types";
import { MOCK_USER_ID } from "./users";

export const MOCK_CHAT_ID = "00000000-0000-0000-0000-000000000001" as DBChatId;
export const FIXED_DATE = new Date("2025-01-01T00:00:00.000Z");
export const FIXED_DATE_STRING = FIXED_DATE.toISOString();

export function generateChatId(index: number): DBChatId {
    const paddedIndex = (index + 1).toString().padStart(12, "0");
    return `00000000-0000-0000-0000-${paddedIndex}` as DBChatId;
}

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

type CreateMockChatOverrides = Partial<DBChat> & { index?: number };

export function createMockChat(overrides?: CreateMockChatOverrides): DBChat {
    const index = overrides?.index ?? 0;
    const fixedDate = new Date(FIXED_DATE);
    fixedDate.setDate(fixedDate.getDate() - index);
    const date = fixedDate.toISOString();

    return {
        id: generateChatId(index),
        userId: MOCK_USER_ID,
        title: generateChatTitle(index),
        visibility: CHAT_VISIBILITY.PUBLIC,
        createdAt: date,
        updatedAt: date,
        visibleAt: date,
        ...overrides,
    } as const;
}

type CreateMockChatsOverrides = Partial<DBChat> & { length?: number };

export function createMockChats(
    overrides?: CreateMockChatsOverrides,
): DBChat[] {
    const length = overrides?.length ?? 10;

    return Array.from({ length }, (_, index) =>
        createMockChat({ ...overrides, index }),
    );
}

type CreateMockPaginatedChatsOverrides = Partial<DBChat> & {
    length?: number;
    hasNextPage?: boolean;
    nextOffset?: number;
};
export function createMockPaginatedChats(
    overrides?: CreateMockPaginatedChatsOverrides,
): PaginatedData<DBChat[]> {
    const length = overrides?.length ?? 10;
    const hasNextPage = overrides?.hasNextPage ?? false;
    const nextOffset = overrides?.nextOffset ?? undefined;

    return {
        data: createMockChats(overrides),
        totalCount: length,
        hasNextPage,
        nextOffset,
    };
}

export function createMockPrivateChat(
    overrides?: CreateMockChatOverrides,
): DBChat {
    return createMockChat({
        visibility: CHAT_VISIBILITY.PRIVATE,
        ...overrides,
    });
}

export function createMockPublicChat(
    overrides?: CreateMockChatOverrides,
): DBChat {
    return createMockChat({
        visibility: CHAT_VISIBILITY.PUBLIC,
        ...overrides,
    });
}

const snippetTemplates = [
    "In this conversation, we discussed the key concepts and best practices for",
    "The main topic covered here is",
    "We explored various approaches to",
    "This chat focused on understanding",
    "Here we learned about",
    "The discussion revolved around",
    "We went through the fundamentals of",
    "This conversation explains how to",
    "We covered important aspects of",
    "The main focus was on",
    "In this session, we talked about",
    "We delved into the details of",
    "This chat provides insights into",
    "We examined different strategies for",
    "The conversation highlights",
];

const snippetEndings = [
    "and its practical applications.",
    "with real-world examples.",
    "including common pitfalls to avoid.",
    "and how to implement it effectively.",
    "covering both theory and practice.",
    "with step-by-step guidance.",
    "and best practices to follow.",
    "including performance considerations.",
    "with code examples and explanations.",
    "and troubleshooting tips.",
    "covering advanced techniques.",
    "with a focus on modern approaches.",
    "and integration strategies.",
    "including security best practices.",
    "with optimization recommendations.",
];

export function generateChatSnippet(index: number, title: string): string {
    const templateIndex = index % snippetTemplates.length;
    const endingIndex = index % snippetEndings.length;
    const template = snippetTemplates[templateIndex];
    const ending = snippetEndings[endingIndex];

    const titleLower = title.toLowerCase();
    let topic = title;

    if (titleLower.includes("how to")) {
        topic = title.replace(/^how to /i, "");
    } else if (titleLower.startsWith("understanding ")) {
        topic = title.replace(/^understanding /i, "");
    } else if (titleLower.includes(" a ")) {
        const parts = title.split(/ a /i);
        topic = parts[parts.length - 1] || title;
    } else {
        const words = title.split(" ");
        topic = words[words.length - 1] || title;
    }

    return `${template} ${topic.toLowerCase()} ${ending}`;
}

export function createMockSearchResult(
    index: number = 0,
    snippet?: string,
    overrides?: Partial<DBChat>,
): DBChatSearchResult {
    const chat = createMockChat({ ...overrides, index });
    return {
        ...chat,
        snippet: snippet || generateChatSnippet(index, chat.title),
    };
}

export function createMockSearchResults(
    query: string,
    limit: number = 10,
    startIndex: number = 0,
    overrides?: Partial<DBChat>,
): DBChatSearchResult[] {
    const queryLower = query.toLowerCase();

    const totalChatsNeeded = startIndex + limit;
    const allChats = createMockChats({
        length: totalChatsNeeded * 2,
        ...overrides,
    });

    const matchingChats: DBChatSearchResult[] = [];
    let currentIndex = startIndex;

    for (let i = 0; i < allChats.length && matchingChats.length < limit; i++) {
        const chat = allChats[i];
        const titleLower = chat.title.toLowerCase();
        const matchesTitle =
            titleLower.includes(queryLower) ||
            chat.title
                .split(" ")
                .some(word => word.toLowerCase().includes(queryLower));

        if (matchesTitle) {
            matchingChats.push(
                createMockSearchResult(
                    currentIndex,
                    generateChatSnippet(currentIndex, chat.title),
                    overrides,
                ),
            );
            currentIndex++;
        }
    }

    while (matchingChats.length < limit) {
        const chatIndex = currentIndex;
        const chat = createMockChat({ ...overrides, index: chatIndex });
        const titleWithQuery = `${chat.title} ${query}`;
        matchingChats.push(
            createMockSearchResult(
                chatIndex,
                generateChatSnippet(chatIndex, titleWithQuery),
                overrides,
            ),
        );
        currentIndex++;
    }

    return matchingChats.slice(0, limit);
}

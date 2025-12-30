import { sub } from "date-fns";

import type { SearchResultsItemResult } from "@/components/ui/search/search-results-item";

import { FIXED_DATE } from "./chats";

const today = FIXED_DATE;
const yesterday = sub(FIXED_DATE, { days: 1 });
const fixedDate1 = sub(FIXED_DATE, { days: 1 });
const fixedDate2 = sub(FIXED_DATE, { days: 2 });
const fixedDate3 = sub(FIXED_DATE, { days: 3 });

export const MOCK_SEARCH_RESULTS: SearchResultsItemResult[] = [
    {
        id: "1",
        title: "Getting Started with React",
        snippet:
            "Learn the basics of React and how to build your first component",
        updatedAt: today.toISOString(),
        createdAt: today.toISOString(),
        href: "/chat/1",
    },
    {
        id: "2",
        title: "Advanced TypeScript Patterns",
        snippet: "Explore advanced TypeScript patterns and best practices",
        updatedAt: yesterday.toISOString(),
        createdAt: yesterday.toISOString(),
        href: "/chat/2",
    },
    {
        id: "3",
        title: "Building with Next.js",
        snippet: "Create modern web applications with Next.js framework",
        updatedAt: fixedDate1.toISOString(),
        createdAt: fixedDate1.toISOString(),
        href: "/chat/3",
    },
].sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
});

export const MOCK_GROUPED_SEARCH_RESULTS: Record<
    string,
    SearchResultsItemResult[]
> = {
    Recent: [
        {
            id: "1",
            title: "Getting Started with React",
            snippet:
                "Learn the basics of React and how to build your first component",
            updatedAt: today.toISOString(),
            createdAt: today.toISOString(),
            href: "/chat/1",
        },
        {
            id: "2",
            title: "Advanced TypeScript Patterns",
            snippet: "Explore advanced TypeScript patterns and best practices",
            updatedAt: yesterday.toISOString(),
            createdAt: yesterday.toISOString(),
            href: "/chat/2",
        },
        {
            id: "3",
            title: "Building with Next.js",
            snippet: "Create modern web applications with Next.js framework",
            updatedAt: fixedDate1.toISOString(),
            createdAt: fixedDate2.toISOString(),
            href: "/chat/3",
        },
        {
            id: "7",
            title: "React Server Components Explained",
            snippet:
                "Understanding the new React Server Components architecture and how to use them effectively",
            updatedAt: today.toISOString(),
            createdAt: today.toISOString(),
            href: "/chat/7",
        },
        {
            id: "8",
            title: "Testing React Applications",
            snippet:
                "Best practices for unit testing, integration testing, and E2E testing with React",
            updatedAt: yesterday.toISOString(),
            createdAt: yesterday.toISOString(),
            href: "/chat/8",
        },
    ].sort((a, b) => {
        return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    }),
    Popular: [
        {
            id: "4",
            title: "Understanding React Hooks",
            snippet:
                "Deep dive into useState, useEffect, and custom hooks patterns",
            updatedAt: yesterday.toISOString(),
            createdAt: yesterday.toISOString(),
            href: "/chat/4",
        },
        {
            id: "5",
            title: "CSS-in-JS vs Tailwind CSS",
            snippet:
                "Comparing styling approaches for modern React applications",
            updatedAt: fixedDate2.toISOString(),
            createdAt: fixedDate2.toISOString(),
            href: "/chat/5",
        },
        {
            id: "6",
            title: "State Management Best Practices",
            snippet: "Exploring Zustand, Redux, and Context API use cases",
            updatedAt: fixedDate2.toISOString(),
            createdAt: fixedDate2.toISOString(),
            href: "/chat/6",
        },
        {
            id: "9",
            title: "Performance Optimization in React",
            snippet:
                "Techniques for optimizing React applications including memoization, code splitting, and lazy loading",
            updatedAt: fixedDate3.toISOString(),
            createdAt: fixedDate3.toISOString(),
            href: "/chat/9",
        },
        {
            id: "10",
            title: "GraphQL vs REST API",
            snippet:
                "Comparing GraphQL and REST API approaches for building modern applications",
            updatedAt: fixedDate3.toISOString(),
            createdAt: fixedDate3.toISOString(),
            href: "/chat/10",
        },
        {
            id: "11",
            title: "Web Accessibility (a11y) Guide",
            snippet:
                "Making your React applications accessible to all users with ARIA attributes and semantic HTML",
            updatedAt: fixedDate3.toISOString(),
            createdAt: fixedDate3.toISOString(),
            href: "/chat/11",
        },
        {
            id: "12",
            title: "Deploying Next.js to Production",
            snippet:
                "Step-by-step guide to deploying Next.js applications to Vercel, AWS, and other platforms",
            updatedAt: fixedDate3.toISOString(),
            createdAt: fixedDate3.toISOString(),
            href: "/chat/12",
        },
    ].sort((a, b) => {
        return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    }),
};

export const MOCK_INITIAL_SEARCH_DATA: SearchResultsItemResult[] = [
    {
        id: "initial-1",
        title: "Welcome to CloneGPT",
        snippet: "Get started with your first conversation",
        updatedAt: today.toISOString(),
        createdAt: today.toISOString(),
        href: "/chat/initial-1",
    },
    {
        id: "initial-2",
        title: "Quick Start Guide",
        snippet: "Learn how to use CloneGPT effectively",
        updatedAt: yesterday.toISOString(),
        createdAt: yesterday.toISOString(),
        href: "/chat/initial-2",
    },
    {
        id: "initial-3",
        title: "Tips & Tricks",
        snippet: "Discover advanced features and shortcuts",
        updatedAt: fixedDate1.toISOString(),
        createdAt: fixedDate1.toISOString(),
        href: "/chat/initial-3",
    },
];

export function getSearchResults(
    query: string,
    results: SearchResultsItemResult[] = MOCK_SEARCH_RESULTS,
): SearchResultsItemResult[] {
    if (!query) return [];

    return results.filter(
        result =>
            result.title.toLowerCase().includes(query.toLowerCase()) ||
            result.snippet?.toLowerCase().includes(query.toLowerCase()),
    );
}

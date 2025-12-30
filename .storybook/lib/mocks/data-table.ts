const FIXED_DATE = new Date("2025-01-01");

export type DataTableUser = {
    id: string;
    name: string;
    email: string;
    role: string;
    status: "active" | "inactive";
    createdAt: Date;
};

export type DataTableProduct = {
    id: string;
    name: string;
    price: number;
    stock: number;
    category: string;
};

export function createMockDataTableUsers(count: number): DataTableUser[] {
    return Array.from({ length: count }, (_, i) => ({
        id: `user-${i + 1}`,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        role: i % 3 === 0 ? "Admin" : i % 2 === 0 ? "Editor" : "Viewer",
        status: i % 4 === 0 ? ("inactive" as const) : ("active" as const),
        createdAt: new Date(FIXED_DATE.getTime() + i * 24 * 60 * 60 * 1000),
    }));
}

export function createMockDataTableProducts(count: number): DataTableProduct[] {
    const categories = ["Electronics", "Clothing", "Books", "Home"];
    return Array.from({ length: count }, (_, i) => ({
        id: `product-${i + 1}`,
        name: `Product ${i + 1}`,
        price:
            Math.round(
                (10 + ((i * 37.5) % 1000) + ((i * 7) % 100) / 100) * 100,
            ) / 100,
        stock: (i * 7) % 100,
        category: categories[i % categories.length],
    }));
}

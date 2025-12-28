import { FIXED_DATE } from "#.storybook/lib/mocks/chats";
import preview from "#.storybook/preview";
import { IconEdit, IconMail, IconTrash, IconUser } from "@tabler/icons-react";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { expect, waitFor } from "storybook/test";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { DataTable, DataTableContent, DataTablePagination } from "./index";

type User = {
    id: string;
    name: string;
    email: string;
    role: string;
    status: "active" | "inactive";
    createdAt: Date;
};

type Product = {
    id: string;
    name: string;
    price: number;
    stock: number;
    category: string;
};

// Sample data generators
const generateUsers = (count: number): User[] => {
    return Array.from({ length: count }, (_, i) => ({
        id: `user-${i + 1}`,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        role: i % 3 === 0 ? "Admin" : i % 2 === 0 ? "Editor" : "Viewer",
        status: i % 4 === 0 ? ("inactive" as const) : ("active" as const),
        createdAt: new Date(FIXED_DATE.getTime() + i * 24 * 60 * 60 * 1000),
    }));
};

const generateProducts = (count: number): Product[] => {
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
};

// Column definitions
const userColumns: ColumnDef<User>[] = [
    {
        id: "name",
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <IconUser className="size-4 text-zinc-400" />
                <span>{row.original.name}</span>
            </div>
        ),
        meta: {
            className: "font-medium",
            skeleton: () => <Skeleton className="h-4 w-32" />,
        },
    },
    {
        id: "email",
        accessorKey: "email",
        header: "Email",
        cell: ({ row }) => (
            <div className="flex items-center gap-2">
                <IconMail className="size-4 text-zinc-400" />
                <span className="text-zinc-400">{row.original.email}</span>
            </div>
        ),
        meta: {
            skeleton: () => <Skeleton className="h-4 w-48" />,
        },
    },
    {
        id: "role",
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
            const roleColors = {
                Admin: "text-blue-400",
                Editor: "text-green-400",
                Viewer: "text-zinc-400",
            };
            return (
                <span
                    className={
                        roleColors[row.original.role as keyof typeof roleColors]
                    }
                >
                    {row.original.role}
                </span>
            );
        },
        meta: {
            skeleton: () => <Skeleton className="h-4 w-20" />,
        },
    },
    {
        id: "status",
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const isActive = row.original.status === "active";
            return (
                <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                        isActive
                            ? "bg-green-500/20 text-green-400"
                            : "bg-red-500/20 text-red-400"
                    }`}
                >
                    {row.original.status}
                </span>
            );
        },
        meta: {
            skeleton: () => <Skeleton className="h-6 w-16" />,
        },
    },
    {
        id: "actions",
        header: "Actions",
        cell: () => (
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="xs" className="h-8 w-8 p-0">
                    <span className="sr-only">Edit</span>
                    <IconEdit className="size-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="xs"
                    className="h-8 w-8 p-0 text-red-400 hover:text-red-500"
                >
                    <span className="sr-only">Delete</span>
                    <IconTrash className="size-4" />
                </Button>
            </div>
        ),
        meta: {
            className: "w-24",
            skeleton: () => <Skeleton className="h-8 w-16" />,
        },
    },
];

const productColumns: ColumnDef<Product>[] = [
    {
        id: "name",
        accessorKey: "name",
        header: "Product Name",
        meta: {
            className: "font-medium",
            skeleton: () => <Skeleton className="h-4 w-40" />,
        },
    },
    {
        id: "category",
        accessorKey: "category",
        header: "Category",
        meta: {
            skeleton: () => <Skeleton className="h-4 w-24" />,
        },
    },
    {
        id: "price",
        accessorKey: "price",
        header: "Price",
        cell: ({ row }) => {
            return `$${row.original.price.toFixed(2)}`;
        },
        meta: {
            className: "text-right",
            skeleton: () => <Skeleton className="ml-auto h-4 w-20" />,
        },
    },
    {
        id: "stock",
        accessorKey: "stock",
        header: "Stock",
        cell: ({ row }) => {
            const stock = row.original.stock;
            const isLowStock = stock < 10;
            return (
                <span
                    className={isLowStock ? "text-red-400" : "text-green-400"}
                >
                    {stock}
                </span>
            );
        },
        meta: {
            className: "text-right",
            skeleton: () => <Skeleton className="ml-auto h-4 w-16" />,
        },
    },
];

const meta = preview.meta({
    component: DataTable,
    parameters: {
        a11y: {
            test: "error",
        },
    },
});

export const Default = meta.story({
    render: () => {
        const users = generateUsers(10);

        return (
            <div className="bg-zinc-925 w-full max-w-5xl">
                <DataTable
                    columns={userColumns}
                    data={users}
                    error={null}
                    options={{
                        pageSize: 10,
                    }}
                >
                    <DataTableContent />
                </DataTable>
            </div>
        );
    },
});

export const WithPagination = meta.story({
    render: () => {
        const users = generateUsers(45);

        return (
            <div className="bg-zinc-925 w-full max-w-5xl space-y-4">
                <DataTable
                    columns={userColumns}
                    data={users}
                    error={null}
                    options={{
                        pageSize: 10,
                    }}
                >
                    <DataTableContent />
                    <DataTablePagination className="mt-4" />
                </DataTable>
            </div>
        );
    },
});

WithPagination.test(
    "should change rows per page",
    async ({ canvas, userEvent }) => {
        const select = canvas.getByRole("combobox");
        const rows = canvas.getAllByRole("row");
        const firstPageButton = canvas.getByRole("button", {
            name: /go to first page/i,
        });
        const prevButton = canvas.getByRole("button", {
            name: /go to previous page/i,
        });
        const nextButton = canvas.getByRole("button", {
            name: /go to next page/i,
        });
        const lastPageButton = canvas.getByRole("button", {
            name: /go to last page/i,
        });

        expect(rows).toHaveLength(11);
        expect(firstPageButton).toBeDisabled();
        expect(prevButton).toBeDisabled();
        expect(nextButton).toBeEnabled();
        expect(lastPageButton).toBeEnabled();
        expect(canvas.getByText("Page 1 of 5")).toBeVisible();
        expect(canvas.getByText("User 1")).toBeVisible();
        expect(canvas.getByText("User 10")).toBeVisible();

        await userEvent.click(select);

        const options = await waitFor(() => {
            const options = Array.from(
                document.querySelectorAll("div[role='option']"),
            );
            return options;
        });

        await userEvent.click(options[1]);

        const rows2 = canvas.getAllByRole("row");
        expect(rows2).toHaveLength(21);
        expect(firstPageButton).toBeDisabled();
        expect(prevButton).toBeDisabled();
        expect(nextButton).toBeEnabled();
        expect(lastPageButton).toBeEnabled();
        expect(canvas.getByText("Page 1 of 3")).toBeVisible();
        expect(canvas.getByText("User 1")).toBeVisible();
        expect(canvas.getByText("User 20")).toBeVisible();

        await userEvent.click(select);

        const options2 = await waitFor(() => {
            const options = Array.from(
                document.querySelectorAll("div[role='option']"),
            );
            return options;
        });
        await userEvent.click(options2[options2.length - 1]);

        const rows3 = canvas.getAllByRole("row");
        expect(rows3).toHaveLength(46);
        expect(firstPageButton).toBeDisabled();
        expect(prevButton).toBeDisabled();
        expect(nextButton).toBeDisabled();
        expect(lastPageButton).toBeDisabled();
        expect(canvas.getByText("Page 1 of 1")).toBeVisible();
        expect(canvas.getByText("User 1")).toBeVisible();
        expect(canvas.getByText("User 45")).toBeVisible();
    },
);

WithPagination.test(
    "should navigate to next pages and back to first page",
    async ({ canvas, userEvent }) => {
        expect(canvas.getByText("User 1")).toBeVisible();
        expect(canvas.getByText("User 10")).toBeVisible();
        expect(canvas.getByText("Page 1 of 5")).toBeVisible();

        const firstPageButton = canvas.getByRole("button", {
            name: /go to first page/i,
        });
        const prevButton = canvas.getByRole("button", {
            name: /go to previous page/i,
        });
        const nextButton = canvas.getByRole("button", {
            name: /go to next page/i,
        });
        const lastPageButton = canvas.getByRole("button", {
            name: /go to last page/i,
        });

        expect(firstPageButton).toBeDisabled();
        expect(nextButton).toBeEnabled();
        expect(prevButton).toBeDisabled();
        expect(lastPageButton).toBeEnabled();

        await userEvent.click(nextButton);

        expect(canvas.queryByText("User 1")).toBeNull();
        expect(canvas.queryByText("User 10")).toBeNull();
        expect(canvas.queryByText("Page 1 of 5")).toBeNull();
        expect(canvas.getByText("Page 2 of 5")).toBeVisible();
        expect(canvas.getByText("User 11")).toBeVisible();
        expect(canvas.getByText("User 20")).toBeVisible();
        expect(firstPageButton).toBeEnabled();
        expect(prevButton).toBeEnabled();
        expect(nextButton).toBeEnabled();
        expect(lastPageButton).toBeEnabled();

        await userEvent.click(nextButton);

        expect(canvas.queryByText("User 11")).toBeNull();
        expect(canvas.queryByText("User 20")).toBeNull();
        expect(canvas.queryByText("Page 2 of 5")).toBeNull();
        expect(canvas.getByText("Page 3 of 5")).toBeVisible();
        expect(canvas.getByText("User 21")).toBeVisible();
        expect(canvas.getByText("User 30")).toBeVisible();
        expect(firstPageButton).toBeEnabled();
        expect(prevButton).toBeEnabled();
        expect(nextButton).toBeEnabled();
        expect(lastPageButton).toBeEnabled();

        await userEvent.click(nextButton);

        expect(canvas.queryByText("User 21")).toBeNull();
        expect(canvas.queryByText("User 30")).toBeNull();
        expect(canvas.queryByText("Page 3 of 5")).toBeNull();
        expect(canvas.getByText("Page 4 of 5")).toBeVisible();
        expect(canvas.getByText("User 31")).toBeVisible();
        expect(canvas.getByText("User 40")).toBeVisible();
        expect(firstPageButton).toBeEnabled();
        expect(prevButton).toBeEnabled();
        expect(nextButton).toBeEnabled();
        expect(lastPageButton).toBeEnabled();

        await userEvent.click(nextButton);

        expect(canvas.queryByText("User 31")).toBeNull();
        expect(canvas.queryByText("User 40")).toBeNull();
        expect(canvas.queryByText("Page 4 of 5")).toBeNull();
        expect(canvas.getByText("Page 5 of 5")).toBeVisible();
        expect(canvas.getByText("User 41")).toBeVisible();
        expect(canvas.getByText("User 45")).toBeVisible();
        expect(firstPageButton).toBeEnabled();
        expect(prevButton).toBeEnabled();
        expect(nextButton).toBeDisabled();
        expect(lastPageButton).toBeDisabled();

        await userEvent.click(prevButton);

        expect(canvas.queryByText("User 41")).toBeNull();
        expect(canvas.queryByText("User 45")).toBeNull();
        expect(canvas.queryByText("Page 5 of 5")).toBeNull();
        expect(canvas.getByText("Page 4 of 5")).toBeVisible();
        expect(canvas.getByText("User 31")).toBeVisible();
        expect(canvas.getByText("User 40")).toBeVisible();
        expect(firstPageButton).toBeEnabled();
        expect(prevButton).toBeEnabled();
        expect(nextButton).toBeEnabled();
        expect(lastPageButton).toBeEnabled();

        await userEvent.click(prevButton);

        expect(canvas.queryByText("User 31")).toBeNull();
        expect(canvas.queryByText("User 40")).toBeNull();
        expect(canvas.queryByText("Page 4 of 5")).toBeNull();
        expect(canvas.getByText("Page 3 of 5")).toBeVisible();
        expect(canvas.getByText("User 21")).toBeVisible();
        expect(canvas.getByText("User 30")).toBeVisible();
        expect(firstPageButton).toBeEnabled();
        expect(prevButton).toBeEnabled();
        expect(nextButton).toBeEnabled();
        expect(lastPageButton).toBeEnabled();

        await userEvent.click(prevButton);

        expect(canvas.queryByText("User 21")).toBeNull();
        expect(canvas.queryByText("User 30")).toBeNull();
        expect(canvas.queryByText("Page 3 of 5")).toBeNull();
        expect(canvas.getByText("Page 2 of 5")).toBeVisible();
        expect(canvas.getByText("User 11")).toBeVisible();
        expect(canvas.getByText("User 20")).toBeVisible();
        expect(firstPageButton).toBeEnabled();
        expect(prevButton).toBeEnabled();
        expect(nextButton).toBeEnabled();
        expect(lastPageButton).toBeEnabled();

        await userEvent.click(prevButton);

        expect(canvas.queryByText("User 11")).toBeNull();
        expect(canvas.queryByText("User 20")).toBeNull();
        expect(canvas.queryByText("Page 2 of 5")).toBeNull();
        expect(canvas.getByText("Page 1 of 5")).toBeVisible();
        expect(canvas.getByText("User 1")).toBeVisible();
        expect(canvas.getByText("User 10")).toBeVisible();
        expect(firstPageButton).toBeDisabled();
        expect(prevButton).toBeDisabled();
        expect(nextButton).toBeEnabled();
        expect(lastPageButton).toBeEnabled();
    },
);

WithPagination.test(
    "should navigate to last page and back to first page",
    async ({ canvas, userEvent }) => {
        expect(canvas.getByText("User 1")).toBeVisible();
        expect(canvas.getByText("User 10")).toBeVisible();
        expect(canvas.getByText("Page 1 of 5")).toBeVisible();

        const firstPageButton = canvas.getByRole("button", {
            name: /go to first page/i,
        });
        const prevButton = canvas.getByRole("button", {
            name: /go to previous page/i,
        });
        const nextButton = canvas.getByRole("button", {
            name: /go to next page/i,
        });
        const lastPageButton = canvas.getByRole("button", {
            name: /go to last page/i,
        });

        expect(firstPageButton).toBeDisabled();
        expect(nextButton).toBeEnabled();
        expect(prevButton).toBeDisabled();
        expect(lastPageButton).toBeEnabled();

        await userEvent.click(lastPageButton);

        expect(canvas.queryByText("User 1")).toBeNull();
        expect(canvas.queryByText("User 10")).toBeNull();
        expect(canvas.queryByText("Page 1 of 5")).toBeNull();
        expect(canvas.getByText("Page 5 of 5")).toBeVisible();
        expect(canvas.getByText("User 41")).toBeVisible();
        expect(canvas.getByText("User 45")).toBeVisible();

        expect(firstPageButton).toBeEnabled();
        expect(prevButton).toBeEnabled();
        expect(nextButton).toBeDisabled();
        expect(lastPageButton).toBeDisabled();

        await userEvent.click(firstPageButton);

        expect(canvas.getByText("User 1")).toBeVisible();
        expect(canvas.getByText("User 10")).toBeVisible();
        expect(canvas.getByText("Page 1 of 5")).toBeVisible();

        expect(firstPageButton).toBeDisabled();
        expect(prevButton).toBeDisabled();
        expect(nextButton).toBeEnabled();
        expect(lastPageButton).toBeEnabled();
    },
);

export const WithLoadingState = meta.story({
    render: () => {
        const [isLoading, setIsLoading] = useState(true);

        return (
            <div className="bg-zinc-925 w-full max-w-5xl space-y-4">
                <Button
                    onClick={() => setIsLoading(!isLoading)}
                    className="mb-4"
                >
                    Toggle Loading
                </Button>
                <DataTable
                    columns={userColumns}
                    data={isLoading ? [] : generateUsers(10)}
                    isLoading={isLoading}
                    error={null}
                    options={{
                        pageSize: 10,
                    }}
                >
                    <DataTableContent />
                </DataTable>
            </div>
        );
    },
});

WithLoadingState.test(
    "should show skeletons while loading and hide them when data is loaded",
    async ({ canvas, userEvent }) => {
        expect(canvas.queryByText("User 1")).toBeNull();

        await waitFor(() => {
            const skeletons = document.querySelectorAll(
                '[data-testid="skeleton"]',
            );
            expect(skeletons.length).toBeGreaterThan(0);
            expect(skeletons[0]).toBeVisible();
        });

        await userEvent.click(
            canvas.getByRole("button", {
                name: /toggle loading/i,
            }),
        );

        await waitFor(() => {
            const skeletons = document.querySelectorAll(
                '[data-testid="skeleton"]',
            );
            expect(skeletons.length).toBe(0);
        });

        expect(canvas.getByText("User 1")).toBeVisible();
    },
);

export const WithErrorState = meta.story({
    render: () => {
        const [showError, setShowError] = useState(true);

        return (
            <div className="bg-zinc-925 w-full max-w-5xl space-y-4">
                <Button
                    onClick={() => setShowError(!showError)}
                    className="mb-4"
                >
                    Toggle Error
                </Button>
                <DataTable
                    columns={userColumns}
                    data={[]}
                    error={
                        showError
                            ? new Error(
                                  "Failed to load data. Please try again.",
                              )
                            : null
                    }
                    options={{
                        pageSize: 10,
                    }}
                >
                    <DataTableContent errorMessage="Custom error message" />
                </DataTable>
            </div>
        );
    },
});

export const WithEmptyState = meta.story({
    render: () => {
        return (
            <div className="bg-zinc-925 w-full max-w-5xl">
                <DataTable
                    columns={userColumns}
                    data={[]}
                    error={null}
                    options={{
                        pageSize: 10,
                    }}
                >
                    <DataTableContent noResultsMessage="No users found. Create your first user to get started." />
                </DataTable>
            </div>
        );
    },
});

export const ProductsTable = meta.story({
    render: () => {
        const products = generateProducts(25);

        return (
            <div className="bg-zinc-925 w-full max-w-5xl space-y-4">
                <DataTable
                    columns={productColumns}
                    data={products}
                    error={null}
                    options={{
                        pageSize: 10,
                    }}
                >
                    <DataTableContent />
                    <DataTablePagination className="mt-4" />
                </DataTable>
            </div>
        );
    },
});

export const CustomPageSize = meta.story({
    render: () => {
        const users = generateUsers(50);

        return (
            <div className="bg-zinc-925 w-full max-w-5xl space-y-4">
                <DataTable
                    columns={userColumns}
                    data={users}
                    error={null}
                    options={{
                        pageSize: 20,
                    }}
                >
                    <DataTableContent />
                    <DataTablePagination className="mt-4" />
                </DataTable>
            </div>
        );
    },
});

export const WithoutPagination = meta.story({
    render: () => {
        const users = generateUsers(15);

        return (
            <div className="bg-zinc-925 w-full max-w-5xl">
                <DataTable
                    columns={userColumns}
                    data={users}
                    error={null}
                    options={{
                        pageSize: 100,
                    }}
                >
                    <DataTableContent />
                </DataTable>
            </div>
        );
    },
});

export const ManualPagination = meta.story({
    render: () => {
        const [page, setPage] = useState(0);
        const pageSize = 10;
        const totalCount = 45;
        const allUsers = generateUsers(totalCount);
        const currentPageUsers = allUsers.slice(
            page * pageSize,
            (page + 1) * pageSize,
        );

        const handleNextPage = () => {
            if ((page + 1) * pageSize < totalCount) {
                setPage(p => p + 1);
            }
        };

        const handlePrevPage = () => {
            if (page > 0) {
                setPage(p => p - 1);
            }
        };

        const handleFirstPage = () => {
            setPage(0);
        };

        const handleLastPage = () => {
            setPage(Math.floor((totalCount - 1) / pageSize));
        };

        return (
            <div className="bg-zinc-925 w-full max-w-5xl space-y-4">
                <DataTable
                    columns={userColumns}
                    data={currentPageUsers}
                    error={null}
                    options={{
                        pageSize,
                        totalCount,
                        manualPagination: true,
                    }}
                >
                    <DataTableContent />
                    <DataTablePagination
                        className="mt-4"
                        showSelector={false}
                        onNextPage={handleNextPage}
                        onPrevPage={handlePrevPage}
                        onFirstPage={handleFirstPage}
                        onLastPage={handleLastPage}
                    />
                </DataTable>
            </div>
        );
    },
});

ManualPagination.test(
    "should navigate to next pages and back to first page",
    async ({ canvas, userEvent }) => {
        expect(canvas.getByText("User 1")).toBeVisible();
        expect(canvas.getByText("User 10")).toBeVisible();
        expect(canvas.getByText("Page 1 of 5")).toBeVisible();

        const firstPageButton = canvas.getByRole("button", {
            name: /go to first page/i,
        });
        const prevButton = canvas.getByRole("button", {
            name: /go to previous page/i,
        });
        const nextButton = canvas.getByRole("button", {
            name: /go to next page/i,
        });
        const lastPageButton = canvas.getByRole("button", {
            name: /go to last page/i,
        });

        expect(firstPageButton).toBeDisabled();
        expect(nextButton).toBeEnabled();
        expect(prevButton).toBeDisabled();
        expect(lastPageButton).toBeEnabled();

        await userEvent.click(nextButton);

        expect(canvas.queryByText("User 1")).toBeNull();
        expect(canvas.queryByText("User 10")).toBeNull();
        expect(canvas.queryByText("Page 1 of 5")).toBeNull();
        expect(canvas.getByText("Page 2 of 5")).toBeVisible();
        expect(canvas.getByText("User 11")).toBeVisible();
        expect(canvas.getByText("User 20")).toBeVisible();
        expect(firstPageButton).toBeEnabled();
        expect(prevButton).toBeEnabled();
        expect(nextButton).toBeEnabled();
        expect(lastPageButton).toBeEnabled();

        await userEvent.click(nextButton);

        expect(canvas.queryByText("User 11")).toBeNull();
        expect(canvas.queryByText("User 20")).toBeNull();
        expect(canvas.queryByText("Page 2 of 5")).toBeNull();
        expect(canvas.getByText("Page 3 of 5")).toBeVisible();
        expect(canvas.getByText("User 21")).toBeVisible();
        expect(canvas.getByText("User 30")).toBeVisible();
        expect(firstPageButton).toBeEnabled();
        expect(prevButton).toBeEnabled();
        expect(nextButton).toBeEnabled();
        expect(lastPageButton).toBeEnabled();

        await userEvent.click(nextButton);

        expect(canvas.queryByText("User 21")).toBeNull();
        expect(canvas.queryByText("User 30")).toBeNull();
        expect(canvas.queryByText("Page 3 of 5")).toBeNull();
        expect(canvas.getByText("Page 4 of 5")).toBeVisible();
        expect(canvas.getByText("User 31")).toBeVisible();
        expect(canvas.getByText("User 40")).toBeVisible();
        expect(firstPageButton).toBeEnabled();
        expect(prevButton).toBeEnabled();
        expect(nextButton).toBeEnabled();
        expect(lastPageButton).toBeEnabled();

        await userEvent.click(nextButton);

        expect(canvas.queryByText("User 31")).toBeNull();
        expect(canvas.queryByText("User 40")).toBeNull();
        expect(canvas.queryByText("Page 4 of 5")).toBeNull();
        expect(canvas.getByText("Page 5 of 5")).toBeVisible();
        expect(canvas.getByText("User 41")).toBeVisible();
        expect(canvas.getByText("User 45")).toBeVisible();
        expect(firstPageButton).toBeEnabled();
        expect(prevButton).toBeEnabled();
        expect(nextButton).toBeDisabled();
        expect(lastPageButton).toBeDisabled();

        await userEvent.click(prevButton);

        expect(canvas.queryByText("User 41")).toBeNull();
        expect(canvas.queryByText("User 45")).toBeNull();
        expect(canvas.queryByText("Page 5 of 5")).toBeNull();
        expect(canvas.getByText("Page 4 of 5")).toBeVisible();
        expect(canvas.getByText("User 31")).toBeVisible();
        expect(canvas.getByText("User 40")).toBeVisible();
        expect(firstPageButton).toBeEnabled();
        expect(prevButton).toBeEnabled();
        expect(nextButton).toBeEnabled();
        expect(lastPageButton).toBeEnabled();

        await userEvent.click(prevButton);

        expect(canvas.queryByText("User 31")).toBeNull();
        expect(canvas.queryByText("User 40")).toBeNull();
        expect(canvas.queryByText("Page 4 of 5")).toBeNull();
        expect(canvas.getByText("Page 3 of 5")).toBeVisible();
        expect(canvas.getByText("User 21")).toBeVisible();
        expect(canvas.getByText("User 30")).toBeVisible();
        expect(firstPageButton).toBeEnabled();
        expect(prevButton).toBeEnabled();
        expect(nextButton).toBeEnabled();
        expect(lastPageButton).toBeEnabled();

        await userEvent.click(prevButton);

        expect(canvas.queryByText("User 21")).toBeNull();
        expect(canvas.queryByText("User 30")).toBeNull();
        expect(canvas.queryByText("Page 3 of 5")).toBeNull();
        expect(canvas.getByText("Page 2 of 5")).toBeVisible();
        expect(canvas.getByText("User 11")).toBeVisible();
        expect(canvas.getByText("User 20")).toBeVisible();
        expect(firstPageButton).toBeEnabled();
        expect(prevButton).toBeEnabled();
        expect(nextButton).toBeEnabled();
        expect(lastPageButton).toBeEnabled();

        await userEvent.click(prevButton);

        expect(canvas.queryByText("User 11")).toBeNull();
        expect(canvas.queryByText("User 20")).toBeNull();
        expect(canvas.queryByText("Page 2 of 5")).toBeNull();
        expect(canvas.getByText("Page 1 of 5")).toBeVisible();
        expect(canvas.getByText("User 1")).toBeVisible();
        expect(canvas.getByText("User 10")).toBeVisible();
        expect(firstPageButton).toBeDisabled();
        expect(prevButton).toBeDisabled();
        expect(nextButton).toBeEnabled();
        expect(lastPageButton).toBeEnabled();
    },
);

ManualPagination.test(
    "should navigate to last page and back to first page",
    async ({ canvas, userEvent }) => {
        expect(canvas.getByText("User 1")).toBeVisible();
        expect(canvas.getByText("User 10")).toBeVisible();
        expect(canvas.getByText("Page 1 of 5")).toBeVisible();

        const firstPageButton = canvas.getByRole("button", {
            name: /go to first page/i,
        });
        const prevButton = canvas.getByRole("button", {
            name: /go to previous page/i,
        });
        const nextButton = canvas.getByRole("button", {
            name: /go to next page/i,
        });
        const lastPageButton = canvas.getByRole("button", {
            name: /go to last page/i,
        });

        expect(firstPageButton).toBeDisabled();
        expect(nextButton).toBeEnabled();
        expect(prevButton).toBeDisabled();
        expect(lastPageButton).toBeEnabled();

        await userEvent.click(lastPageButton);

        expect(canvas.queryByText("User 1")).toBeNull();
        expect(canvas.queryByText("User 10")).toBeNull();
        expect(canvas.queryByText("Page 1 of 5")).toBeNull();
        expect(canvas.getByText("Page 5 of 5")).toBeVisible();
        expect(canvas.getByText("User 41")).toBeVisible();
        expect(canvas.getByText("User 45")).toBeVisible();

        expect(firstPageButton).toBeEnabled();
        expect(prevButton).toBeEnabled();
        expect(nextButton).toBeDisabled();
        expect(lastPageButton).toBeDisabled();

        await userEvent.click(firstPageButton);

        expect(canvas.getByText("User 1")).toBeVisible();
        expect(canvas.getByText("User 10")).toBeVisible();
        expect(canvas.getByText("Page 1 of 5")).toBeVisible();

        expect(firstPageButton).toBeDisabled();
        expect(prevButton).toBeDisabled();
        expect(nextButton).toBeEnabled();
        expect(lastPageButton).toBeEnabled();
    },
);

export const MinimalPagination = meta.story({
    render: () => {
        const users = generateUsers(30);

        return (
            <div className="bg-zinc-925 w-full max-w-5xl space-y-4">
                <DataTable
                    columns={userColumns}
                    data={users}
                    error={null}
                    options={{
                        pageSize: 10,
                    }}
                >
                    <DataTableContent />
                    <DataTablePagination
                        className="mt-4"
                        showSelector={false}
                        showCounter={false}
                    />
                </DataTable>
            </div>
        );
    },
});

import preview from "#.storybook/preview";
import { expect } from "storybook/test";

import { Table } from "./table";
import { TableBody } from "./table-body";
import { TableCell } from "./table-cell";
import { TableHead } from "./table-head";
import { TableHeader } from "./table-header";
import { TableRow } from "./table-row";

const invoices = [
    {
        invoice: "INV001",
        status: "Paid",
        method: "Credit Card",
        amount: "$250.00",
    },
    {
        invoice: "INV002",
        status: "Pending",
        method: "PayPal",
        amount: "$150.00",
    },
    {
        invoice: "INV003",
        status: "Unpaid",
        method: "Bank Transfer",
        amount: "$350.00",
    },
    {
        invoice: "INV004",
        status: "Paid",
        method: "Credit Card",
        amount: "$450.00",
    },
    {
        invoice: "INV005",
        status: "Paid",
        method: "PayPal",
        amount: "$550.00",
    },
];

const meta = preview.meta({
    component: Table,
    parameters: {
        a11y: {
            test: "error",
        },
    },
    argTypes: {
        className: {
            control: "text",
            description: "Additional CSS classes for the table",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
    },
});

export const Default = meta.story({
    render: args => (
        <Table className="bg-zinc-925" {...args}>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">Invoice</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {invoices.map(invoice => (
                    <TableRow key={invoice.invoice}>
                        <TableCell className="font-medium">
                            {invoice.invoice}
                        </TableCell>
                        <TableCell>{invoice.status}</TableCell>
                        <TableCell>{invoice.method}</TableCell>
                        <TableCell className="text-right">
                            {invoice.amount}
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    ),
});

Default.test("should render table with correct structure", ({ canvas }) => {
    const table = canvas.getByRole("table");
    expect(table).toBeVisible();

    const columnHeaders = canvas.getAllByRole("columnheader");
    expect(columnHeaders).toHaveLength(4);

    const rows = canvas.getAllByRole("row");
    expect(rows).toHaveLength(6);
});

Default.test("should display all invoices", ({ canvas }) => {
    invoices.forEach(invoice => {
        expect(canvas.getByText(invoice.invoice)).toBeVisible();
        expect(canvas.getByText(invoice.amount)).toBeVisible();
    });
});

export const Empty = meta.story({
    render: args => (
        <Table className="bg-zinc-925" {...args}>
            <TableHeader>
                <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow>
                    <TableCell
                        colSpan={4}
                        className="h-24 text-center text-zinc-100"
                    >
                        No results found.
                    </TableCell>
                </TableRow>
            </TableBody>
        </Table>
    ),
});

Empty.test("should display empty state message", ({ canvas }) => {
    expect(canvas.getByText("No results found.")).toBeVisible();
});

export const ManyRows = meta.story({
    parameters: {
        a11y: {
            disable: true,
        },
    },
    render: args => {
        const manyInvoices = Array.from({ length: 20 }, (_, i) => ({
            invoice: `INV${String(i + 1).padStart(3, "0")}`,
            status: ["Paid", "Pending", "Unpaid"][i % 3],
            method: ["Credit Card", "PayPal", "Bank Transfer"][i % 3],
            amount: `$${(((i * 37.5) % 500) + 100).toFixed(2)}`,
        }));

        return (
            <div className="max-h-[400px] overflow-auto">
                <Table className="bg-zinc-925" {...args}>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Invoice</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {manyInvoices.map(invoice => (
                            <TableRow key={invoice.invoice}>
                                <TableCell className="font-medium">
                                    {invoice.invoice}
                                </TableCell>
                                <TableCell>{invoice.status}</TableCell>
                                <TableCell>{invoice.method}</TableCell>
                                <TableCell className="text-right">
                                    {invoice.amount}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    },
});

ManyRows.test("should render many rows", ({ canvas }) => {
    const rows = canvas.getAllByRole("row");
    expect(rows).toHaveLength(21);
});

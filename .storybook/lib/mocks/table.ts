export type MockInvoice = {
    invoice: string;
    status: string;
    method: string;
    amount: string;
};

export const MOCK_INVOICES: MockInvoice[] = [
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

export const MOCK_INVOICES_MANY = Array.from({ length: 20 }, (_, i) => ({
    invoice: `INV${String(i + 1).padStart(3, "0")}`,
    status: ["Paid", "Pending", "Unpaid"][i % 3],
    method: ["Credit Card", "PayPal", "Bank Transfer"][i % 3],
    amount: `$${(((i * 37.5) % 500) + 100).toFixed(2)}`,
}));

export const MOCK_EMPTY_STATE_MESSAGE = "No results found.";

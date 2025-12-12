"use client";

import { useContext } from "react";

import { DataTableContext } from "./data-table";

export const useDataTableContext = () => {
    const context = useContext(DataTableContext);

    if (!context) {
        throw new Error("useDataTableContext must be used within a DataTable");
    }

    return context;
};

import type { ReactNode } from "react";

declare module "@tanstack/table-core" {
    interface ColumnMeta {
        className?: string;
        skeleton?: (rowIndex: number, columnIndex?: number) => ReactNode;
    }
}

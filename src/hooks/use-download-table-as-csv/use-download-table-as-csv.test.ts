import { renderHook } from "@testing-library/react";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    downloadFile,
    extractTableData,
    tableDataToCSV,
    validateTableElement,
} from "@/lib/utils";

import { useDownloadTableAsCSV } from "./use-download-table-as-csv";

vi.mock("@/lib/utils", () => ({
    validateTableElement: vi.fn(),
    extractTableData: vi.fn(),
    tableDataToCSV: vi.fn(),
    downloadFile: vi.fn(),
}));

describe("useDownloadTableAsCSV", () => {
    const mockTable = document.createElement("table");

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns download function", () => {
        const tableRef = createRef<HTMLTableElement>();
        const { result } = renderHook(() => useDownloadTableAsCSV(tableRef));

        expect(typeof result.current.downloadTableAsCSV).toBe("function");
    });

    it("downloads table as CSV successfully", () => {
        const tableRef = createRef<HTMLTableElement>();
        tableRef.current = mockTable;
        (validateTableElement as ReturnType<typeof vi.fn>).mockReturnValue(
            mockTable,
        );
        (extractTableData as ReturnType<typeof vi.fn>).mockReturnValue([
            ["Header1", "Header2"],
            ["Value1", "Value2"],
        ]);
        (tableDataToCSV as ReturnType<typeof vi.fn>).mockReturnValue(
            "Header1,Header2\nValue1,Value2",
        );
        (downloadFile as ReturnType<typeof vi.fn>).mockReturnValue(true);

        const { result } = renderHook(() => useDownloadTableAsCSV(tableRef));

        const success = result.current.downloadTableAsCSV();

        expect(success).toBe(true);
        expect(downloadFile).toHaveBeenCalledWith(
            expect.any(String),
            "table.csv",
            expect.any(String),
        );
    });

    it("returns false when table ref is null", () => {
        const tableRef = createRef<HTMLTableElement>();
        (validateTableElement as ReturnType<typeof vi.fn>).mockReturnValue(
            null,
        );

        const { result } = renderHook(() => useDownloadTableAsCSV(tableRef));

        const success = result.current.downloadTableAsCSV();

        expect(success).toBe(false);
        expect(downloadFile).not.toHaveBeenCalled();
    });

    it("uses custom filename", () => {
        const tableRef = createRef<HTMLTableElement>();
        tableRef.current = mockTable;
        (validateTableElement as ReturnType<typeof vi.fn>).mockReturnValue(
            mockTable,
        );
        (extractTableData as ReturnType<typeof vi.fn>).mockReturnValue([
            ["Header"],
        ]);
        (tableDataToCSV as ReturnType<typeof vi.fn>).mockReturnValue("Header");
        (downloadFile as ReturnType<typeof vi.fn>).mockReturnValue(true);

        const { result } = renderHook(() =>
            useDownloadTableAsCSV(tableRef, { filename: "custom-name" }),
        );

        result.current.downloadTableAsCSV();

        expect(downloadFile).toHaveBeenCalledWith(
            "Header",
            "custom-name.csv",
            expect.any(String),
        );
    });

    it("uses custom delimiter", () => {
        const tableRef = createRef<HTMLTableElement>();
        tableRef.current = mockTable;
        (validateTableElement as ReturnType<typeof vi.fn>).mockReturnValue(
            mockTable,
        );
        (extractTableData as ReturnType<typeof vi.fn>).mockReturnValue([
            ["Header1", "Header2"],
        ]);
        (tableDataToCSV as ReturnType<typeof vi.fn>).mockImplementation(
            (data, delimiter) => {
                return data[0].join(delimiter);
            },
        );
        (downloadFile as ReturnType<typeof vi.fn>).mockReturnValue(true);

        const { result } = renderHook(() =>
            useDownloadTableAsCSV(tableRef, { delimiter: ";" }),
        );

        result.current.downloadTableAsCSV();

        expect(downloadFile).toHaveBeenCalledWith(
            "Header1;Header2",
            expect.any(String),
            expect.any(String),
        );
    });

    it("returns false on error", () => {
        const tableRef = createRef<HTMLTableElement>();
        tableRef.current = mockTable;
        (validateTableElement as ReturnType<typeof vi.fn>).mockReturnValue(
            mockTable,
        );
        (extractTableData as ReturnType<typeof vi.fn>).mockImplementation(
            () => {
                throw new Error("Extract failed");
            },
        );

        const { result } = renderHook(() => useDownloadTableAsCSV(tableRef));

        const success = result.current.downloadTableAsCSV();

        expect(success).toBe(false);
        expect(downloadFile).not.toHaveBeenCalled();
    });

    it("updates when options change", () => {
        const tableRef = createRef<HTMLTableElement>();
        tableRef.current = mockTable;
        (validateTableElement as ReturnType<typeof vi.fn>).mockReturnValue(
            mockTable,
        );
        (extractTableData as ReturnType<typeof vi.fn>).mockReturnValue([
            ["Header"],
        ]);
        (tableDataToCSV as ReturnType<typeof vi.fn>).mockReturnValue("Header");
        (downloadFile as ReturnType<typeof vi.fn>).mockReturnValue(true);

        const { result, rerender } = renderHook(
            ({ filename }) => useDownloadTableAsCSV(tableRef, { filename }),
            {
                initialProps: { filename: "initial" },
            },
        );

        result.current.downloadTableAsCSV();

        expect(downloadFile).toHaveBeenCalledWith(
            "Header",
            "initial.csv",
            expect.any(String),
        );

        rerender({ filename: "updated" });

        result.current.downloadTableAsCSV();

        expect(downloadFile).toHaveBeenCalledWith(
            "Header",
            "updated.csv",
            expect.any(String),
        );
    });
});

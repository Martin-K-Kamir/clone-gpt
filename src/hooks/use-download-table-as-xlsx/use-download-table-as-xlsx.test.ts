import { renderHook } from "@testing-library/react";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    downloadFile,
    extractTableData,
    validateTableElement,
} from "@/lib/utils";

import { useDownloadTableAsXLSX } from "./use-download-table-as-xlsx";

vi.mock("@/lib/utils", () => ({
    validateTableElement: vi.fn(),
    extractTableData: vi.fn(),
    downloadFile: vi.fn(),
}));

vi.mock("exceljs", () => {
    const mockBuffer = new ArrayBuffer(8);

    class MockWorkbook {
        addWorksheet = vi.fn().mockImplementation(() => ({
            addRow: vi.fn().mockReturnThis(),
        }));

        xlsx = {
            writeBuffer: vi.fn().mockResolvedValue(mockBuffer),
        };
    }

    return {
        default: {
            Workbook: MockWorkbook,
        },
    };
});

describe("useDownloadTableAsXLSX", () => {
    const mockTable = document.createElement("table");
    const mockBuffer = new ArrayBuffer(8);

    beforeEach(() => {
        vi.clearAllMocks();
        (downloadFile as ReturnType<typeof vi.fn>).mockReturnValue(true);
    });

    it("should return download function", () => {
        const tableRef = createRef<HTMLTableElement>();
        const { result } = renderHook(() => useDownloadTableAsXLSX(tableRef));

        expect(typeof result.current.downloadTableAsXLSX).toBe("function");
    });

    it("should download table as XLSX successfully", async () => {
        const tableRef = createRef<HTMLTableElement>();
        tableRef.current = mockTable;
        (validateTableElement as ReturnType<typeof vi.fn>).mockReturnValue(
            mockTable,
        );
        (extractTableData as ReturnType<typeof vi.fn>).mockReturnValue([
            ["Header1", "Header2"],
            ["Value1", "Value2"],
        ]);

        const { result } = renderHook(() => useDownloadTableAsXLSX(tableRef));

        const success = await result.current.downloadTableAsXLSX();

        expect(success).toBe(true);
        expect(downloadFile).toHaveBeenCalledWith(
            expect.any(ArrayBuffer),
            "table-data.xlsx",
            expect.any(String),
        );
    });

    it("should return false when table ref is null", async () => {
        const tableRef = createRef<HTMLTableElement>();
        (validateTableElement as ReturnType<typeof vi.fn>).mockReturnValue(
            null,
        );

        const { result } = renderHook(() => useDownloadTableAsXLSX(tableRef));

        const success = await result.current.downloadTableAsXLSX();

        expect(success).toBe(false);
        expect(downloadFile).not.toHaveBeenCalled();
    });

    it("should use custom filename", async () => {
        const tableRef = createRef<HTMLTableElement>();
        tableRef.current = mockTable;
        (validateTableElement as ReturnType<typeof vi.fn>).mockReturnValue(
            mockTable,
        );
        (extractTableData as ReturnType<typeof vi.fn>).mockReturnValue([
            ["Header"],
        ]);

        const { result } = renderHook(() =>
            useDownloadTableAsXLSX(tableRef, { filename: "custom-name" }),
        );

        await result.current.downloadTableAsXLSX();

        expect(downloadFile).toHaveBeenCalledWith(
            mockBuffer,
            "custom-name.xlsx",
            expect.any(String),
        );
    });

    it("should use custom sheet name", async () => {
        const tableRef = createRef<HTMLTableElement>();
        tableRef.current = mockTable;
        (validateTableElement as ReturnType<typeof vi.fn>).mockReturnValue(
            mockTable,
        );
        (extractTableData as ReturnType<typeof vi.fn>).mockReturnValue([
            ["Header"],
        ]);

        const { result } = renderHook(() =>
            useDownloadTableAsXLSX(tableRef, { sheetName: "MySheet" }),
        );

        const success = await result.current.downloadTableAsXLSX();

        expect(success).toBe(true);
    });

    it("should return false on error", async () => {
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

        const { result } = renderHook(() => useDownloadTableAsXLSX(tableRef));

        const success = await result.current.downloadTableAsXLSX();

        expect(success).toBe(false);
        expect(downloadFile).not.toHaveBeenCalled();
    });

    it("should update when options change", async () => {
        const tableRef = createRef<HTMLTableElement>();
        tableRef.current = mockTable;
        (validateTableElement as ReturnType<typeof vi.fn>).mockReturnValue(
            mockTable,
        );
        (extractTableData as ReturnType<typeof vi.fn>).mockReturnValue([
            ["Header"],
        ]);

        const { result, rerender } = renderHook(
            ({ filename }) => useDownloadTableAsXLSX(tableRef, { filename }),
            {
                initialProps: { filename: "initial" },
            },
        );

        await result.current.downloadTableAsXLSX();

        expect(downloadFile).toHaveBeenCalledWith(
            mockBuffer,
            "initial.xlsx",
            expect.any(String),
        );

        rerender({ filename: "updated" });

        await result.current.downloadTableAsXLSX();

        expect(downloadFile).toHaveBeenCalledWith(
            mockBuffer,
            "updated.xlsx",
            expect.any(String),
        );
    });
});

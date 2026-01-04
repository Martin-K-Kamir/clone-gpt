import { renderHook } from "@testing-library/react";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as XLSX from "xlsx";

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

vi.mock("xlsx", () => ({
    utils: {
        book_new: vi.fn(),
        aoa_to_sheet: vi.fn(),
        book_append_sheet: vi.fn(),
    },
    write: vi.fn(),
}));

describe("useDownloadTableAsXLSX", () => {
    const mockTable = document.createElement("table");
    const mockWorkbook = {};
    const mockWorksheet = {};
    const mockBuffer = new ArrayBuffer(8);

    beforeEach(() => {
        vi.clearAllMocks();
        (XLSX.utils.book_new as ReturnType<typeof vi.fn>).mockReturnValue(
            mockWorkbook,
        );
        (XLSX.utils.aoa_to_sheet as ReturnType<typeof vi.fn>).mockReturnValue(
            mockWorksheet,
        );
        (XLSX.write as ReturnType<typeof vi.fn>).mockReturnValue(mockBuffer);
        (downloadFile as ReturnType<typeof vi.fn>).mockReturnValue(true);
    });

    it("returns download function", () => {
        const tableRef = createRef<HTMLTableElement>();
        const { result } = renderHook(() => useDownloadTableAsXLSX(tableRef));

        expect(typeof result.current.downloadTableAsXLSX).toBe("function");
    });

    it("downloads table as XLSX successfully", () => {
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

        const success = result.current.downloadTableAsXLSX();

        expect(success).toBe(true);
        expect(downloadFile).toHaveBeenCalledWith(
            expect.any(ArrayBuffer),
            "table-data.xlsx",
            expect.any(String),
        );
    });

    it("returns false when table ref is null", () => {
        const tableRef = createRef<HTMLTableElement>();
        (validateTableElement as ReturnType<typeof vi.fn>).mockReturnValue(
            null,
        );

        const { result } = renderHook(() => useDownloadTableAsXLSX(tableRef));

        const success = result.current.downloadTableAsXLSX();

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

        const { result } = renderHook(() =>
            useDownloadTableAsXLSX(tableRef, { filename: "custom-name" }),
        );

        result.current.downloadTableAsXLSX();

        expect(downloadFile).toHaveBeenCalledWith(
            mockBuffer,
            "custom-name.xlsx",
            expect.any(String),
        );
    });

    it("uses custom sheet name", () => {
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

        const success = result.current.downloadTableAsXLSX();

        expect(success).toBe(true);
        expect(downloadFile).toHaveBeenCalled();
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

        const { result } = renderHook(() => useDownloadTableAsXLSX(tableRef));

        const success = result.current.downloadTableAsXLSX();

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

        const { result, rerender } = renderHook(
            ({ filename }) => useDownloadTableAsXLSX(tableRef, { filename }),
            {
                initialProps: { filename: "initial" },
            },
        );

        result.current.downloadTableAsXLSX();

        expect(downloadFile).toHaveBeenCalledWith(
            mockBuffer,
            "initial.xlsx",
            expect.any(String),
        );

        rerender({ filename: "updated" });

        result.current.downloadTableAsXLSX();

        expect(downloadFile).toHaveBeenCalledWith(
            mockBuffer,
            "updated.xlsx",
            expect.any(String),
        );
    });
});

import { describe, expect, it } from "vitest";

import { tableDataToCSV } from "./table-data-to-csv";

describe("tableDataToCSV", () => {
    it("should convert simple table data to CSV", () => {
        const data = [
            ["Name", "Age"],
            ["John", "30"],
            ["Jane", "25"],
        ];
        expect(tableDataToCSV(data)).toBe("Name,Age\nJohn,30\nJane,25");
    });

    it("should handle empty table", () => {
        expect(tableDataToCSV([])).toBe("");
    });

    it("should handle single row", () => {
        const data = [["Name", "Age", "City"]];
        expect(tableDataToCSV(data)).toBe("Name,Age,City");
    });

    it("should handle single cell", () => {
        const data = [["Value"]];
        expect(tableDataToCSV(data)).toBe("Value");
    });

    it("should escape cells with commas", () => {
        const data = [
            ["Name", "Description"],
            ["John", "Likes pizza, burgers"],
        ];
        expect(tableDataToCSV(data)).toBe(
            'Name,Description\nJohn,"Likes pizza, burgers"',
        );
    });

    it("should escape cells with quotes", () => {
        const data = [
            ["Name", "Quote"],
            ["John", 'He said "Hello"'],
        ];
        expect(tableDataToCSV(data)).toBe(
            'Name,Quote\nJohn,"He said ""Hello"""',
        );
    });

    it("should escape cells with newlines", () => {
        const data = [
            ["Name", "Description"],
            ["John", "Line 1\nLine 2"],
        ];
        expect(tableDataToCSV(data)).toBe(
            'Name,Description\nJohn,"Line 1\nLine 2"',
        );
    });

    it("should handle custom delimiter", () => {
        const data = [
            ["Name", "Age"],
            ["John", "30"],
        ];
        expect(tableDataToCSV(data, ";")).toBe("Name;Age\nJohn;30");
    });

    it("should handle empty cells", () => {
        const data = [
            ["Name", "Age", "City"],
            ["John", "", "NYC"],
            ["", "25", ""],
        ];
        expect(tableDataToCSV(data)).toBe("Name,Age,City\nJohn,,NYC\n,25,");
    });

    it("should handle cells with delimiter in custom delimiter mode", () => {
        const data = [
            ["Name", "Value"],
            ["Test", "Value;with;semicolons"],
        ];
        expect(tableDataToCSV(data, ";")).toBe(
            'Name;Value\nTest;"Value;with;semicolons"',
        );
    });

    it("should handle multiple rows with various special characters", () => {
        const data = [
            ["Name", "Description"],
            ["John", 'He said "Hello, world!"'],
            ["Jane", "Multi\nline\ntext"],
        ];
        const result = tableDataToCSV(data);
        expect(result).toContain("John");
        expect(result).toContain("Jane");
    });
});

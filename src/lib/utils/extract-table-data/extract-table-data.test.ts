/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from "vitest";

import { extractTableData } from "./extract-table-data";

describe("extractTableData", () => {
    it("should extract data from simple table", () => {
        const table = document.createElement("table");
        table.innerHTML = `
            <tr>
                <th>Header 1</th>
                <th>Header 2</th>
            </tr>
            <tr>
                <td>Cell 1</td>
                <td>Cell 2</td>
            </tr>
        `;

        const result = extractTableData(table);

        expect(result).toEqual([
            ["Header 1", "Header 2"],
            ["Cell 1", "Cell 2"],
        ]);
    });

    it("should extract data from table with only td cells", () => {
        const table = document.createElement("table");
        table.innerHTML = `
            <tr>
                <td>Row 1 Cell 1</td>
                <td>Row 1 Cell 2</td>
            </tr>
            <tr>
                <td>Row 2 Cell 1</td>
                <td>Row 2 Cell 2</td>
            </tr>
        `;

        const result = extractTableData(table);

        expect(result).toEqual([
            ["Row 1 Cell 1", "Row 1 Cell 2"],
            ["Row 2 Cell 1", "Row 2 Cell 2"],
        ]);
    });

    it("should extract data from table with only th cells", () => {
        const table = document.createElement("table");
        table.innerHTML = `
            <tr>
                <th>Header 1</th>
                <th>Header 2</th>
            </tr>
        `;

        const result = extractTableData(table);

        expect(result).toEqual([["Header 1", "Header 2"]]);
    });

    it("should extract data from table with mixed th and td cells", () => {
        const table = document.createElement("table");
        table.innerHTML = `
            <tr>
                <th>Header 1</th>
                <td>Data 1</td>
            </tr>
            <tr>
                <td>Data 2</td>
                <th>Header 2</th>
            </tr>
        `;

        const result = extractTableData(table);

        expect(result).toEqual([
            ["Header 1", "Data 1"],
            ["Data 2", "Header 2"],
        ]);
    });

    it("should trim whitespace from cell content", () => {
        const table = document.createElement("table");
        table.innerHTML = `
            <tr>
                <td>  Cell with spaces  </td>
                <td>  Another cell  </td>
            </tr>
        `;

        const result = extractTableData(table);

        expect(result).toEqual([["Cell with spaces", "Another cell"]]);
    });

    it("should handle empty cells", () => {
        const table = document.createElement("table");
        table.innerHTML = `
            <tr>
                <td>Cell 1</td>
                <td></td>
                <td>Cell 3</td>
            </tr>
        `;

        const result = extractTableData(table);

        expect(result).toEqual([["Cell 1", "", "Cell 3"]]);
    });

    it("should handle cells with null textContent", () => {
        const table = document.createElement("table");
        const row = document.createElement("tr");
        const cell1 = document.createElement("td");
        cell1.textContent = "Cell 1";
        const cell2 = document.createElement("td");
        const cell3 = document.createElement("td");
        cell3.textContent = "Cell 3";
        row.appendChild(cell1);
        row.appendChild(cell2);
        row.appendChild(cell3);
        table.appendChild(row);

        const result = extractTableData(table);

        expect(result).toEqual([["Cell 1", "", "Cell 3"]]);
    });

    it("should handle table with single row", () => {
        const table = document.createElement("table");
        table.innerHTML = `
            <tr>
                <td>Single cell</td>
            </tr>
        `;

        const result = extractTableData(table);

        expect(result).toEqual([["Single cell"]]);
    });

    it("should handle table with single cell", () => {
        const table = document.createElement("table");
        table.innerHTML = `
            <tr>
                <td>Only one</td>
            </tr>
        `;

        const result = extractTableData(table);

        expect(result).toEqual([["Only one"]]);
    });

    it("should handle table with multiple rows and columns", () => {
        const table = document.createElement("table");
        table.innerHTML = `
            <tr>
                <th>Col 1</th>
                <th>Col 2</th>
                <th>Col 3</th>
            </tr>
            <tr>
                <td>R1 C1</td>
                <td>R1 C2</td>
                <td>R1 C3</td>
            </tr>
            <tr>
                <td>R2 C1</td>
                <td>R2 C2</td>
                <td>R2 C3</td>
            </tr>
        `;

        const result = extractTableData(table);

        expect(result).toEqual([
            ["Col 1", "Col 2", "Col 3"],
            ["R1 C1", "R1 C2", "R1 C3"],
            ["R2 C1", "R2 C2", "R2 C3"],
        ]);
    });

    it("should handle rows with different number of cells", () => {
        const table = document.createElement("table");
        table.innerHTML = `
            <tr>
                <td>Cell 1</td>
                <td>Cell 2</td>
            </tr>
            <tr>
                <td>Cell 3</td>
            </tr>
            <tr>
                <td>Cell 4</td>
                <td>Cell 5</td>
                <td>Cell 6</td>
            </tr>
        `;

        const result = extractTableData(table);

        expect(result).toEqual([
            ["Cell 1", "Cell 2"],
            ["Cell 3"],
            ["Cell 4", "Cell 5", "Cell 6"],
        ]);
    });

    it("should handle empty table", () => {
        const table = document.createElement("table");

        const result = extractTableData(table);

        expect(result).toEqual([]);
    });

    it("should handle cells with newlines and special characters", () => {
        const table = document.createElement("table");
        table.innerHTML = `
            <tr>
                <td>Cell with\nnewline</td>
                <td>Cell with "quotes"</td>
                <td>Cell with &amp; entities</td>
            </tr>
        `;

        const result = extractTableData(table);

        expect(result).toEqual([
            [
                "Cell with\nnewline",
                'Cell with "quotes"',
                "Cell with & entities",
            ],
        ]);
    });

    it("should handle cells with only whitespace", () => {
        const table = document.createElement("table");
        table.innerHTML = `
            <tr>
                <td>   </td>
                <td>  \n\t  </td>
            </tr>
        `;

        const result = extractTableData(table);

        expect(result).toEqual([["", ""]]);
    });

    it("should preserve cell order", () => {
        const table = document.createElement("table");
        table.innerHTML = `
            <tr>
                <td>First</td>
                <td>Second</td>
                <td>Third</td>
            </tr>
        `;

        const result = extractTableData(table);

        expect(result[0]).toEqual(["First", "Second", "Third"]);
    });

    it("should preserve row order", () => {
        const table = document.createElement("table");
        table.innerHTML = `
            <tr><td>Row 1</td></tr>
            <tr><td>Row 2</td></tr>
            <tr><td>Row 3</td></tr>
        `;

        const result = extractTableData(table);

        expect(result).toEqual([["Row 1"], ["Row 2"], ["Row 3"]]);
    });
});

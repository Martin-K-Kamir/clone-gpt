/**
 * @vitest-environment jsdom
 */
import React from "react";
import { describe, expect, it, vi } from "vitest";

import { validateTableElement } from "./validate-table-element";

describe("validateTableElement", () => {
    it("should return table element when ref has current", () => {
        const table = document.createElement("table");
        const ref: React.RefObject<HTMLTableElement> = {
            current: table,
        };

        const result = validateTableElement(ref);

        expect(result).toBe(table);
    });

    it("should return null when ref has no current", () => {
        const ref = {
            current: null,
        } as unknown as React.RefObject<HTMLTableElement>;
        const consoleErrorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});

        const result = validateTableElement(ref);

        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith("No table element found");

        consoleErrorSpy.mockRestore();
    });

    it("should return null when ref.current is null", () => {
        const ref = {
            current: null,
        } as unknown as React.RefObject<HTMLTableElement>;
        const consoleErrorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});

        const result = validateTableElement(ref);

        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalledWith("No table element found");

        consoleErrorSpy.mockRestore();
    });

    it("should return the actual table element", () => {
        const table = document.createElement("table");
        table.id = "test-table";
        const ref: React.RefObject<HTMLTableElement> = {
            current: table,
        };

        const result = validateTableElement(ref);

        expect(result).toBe(table);
        expect(result?.id).toBe("test-table");
    });
});

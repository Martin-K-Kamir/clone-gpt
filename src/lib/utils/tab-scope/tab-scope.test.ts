import { describe, expect, it, vi } from "vitest";

import { tabScope } from "./tab-scope";

describe("tabScope", () => {
    it("should call thisTab handler when scope is 'thisTab'", () => {
        const thisTabHandler = vi.fn();
        const otherTabsHandler = vi.fn();

        tabScope("thisTab", {
            thisTab: thisTabHandler,
            otherTabs: otherTabsHandler,
        });

        expect(thisTabHandler).toHaveBeenCalledOnce();
        expect(otherTabsHandler).not.toHaveBeenCalled();
    });

    it("should call otherTabs handler when scope is 'otherTabs'", () => {
        const thisTabHandler = vi.fn();
        const otherTabsHandler = vi.fn();

        tabScope("otherTabs", {
            thisTab: thisTabHandler,
            otherTabs: otherTabsHandler,
        });

        expect(thisTabHandler).not.toHaveBeenCalled();
        expect(otherTabsHandler).toHaveBeenCalledOnce();
    });

    it("should call both handlers when scope is 'both'", () => {
        const thisTabHandler = vi.fn();
        const otherTabsHandler = vi.fn();

        tabScope("both", {
            thisTab: thisTabHandler,
            otherTabs: otherTabsHandler,
        });

        expect(thisTabHandler).toHaveBeenCalledOnce();
        expect(otherTabsHandler).toHaveBeenCalledOnce();
    });

    it("should call both handlers when scope is default 'both'", () => {
        const thisTabHandler = vi.fn();
        const otherTabsHandler = vi.fn();

        tabScope(undefined, {
            thisTab: thisTabHandler,
            otherTabs: otherTabsHandler,
        });

        expect(thisTabHandler).toHaveBeenCalledOnce();
        expect(otherTabsHandler).toHaveBeenCalledOnce();
    });

    it("should handle missing thisTab handler", () => {
        const otherTabsHandler = vi.fn();

        expect(() => {
            tabScope("thisTab", {
                otherTabs: otherTabsHandler,
            });
        }).not.toThrow();

        expect(otherTabsHandler).not.toHaveBeenCalled();
    });

    it("should handle missing otherTabs handler", () => {
        const thisTabHandler = vi.fn();

        expect(() => {
            tabScope("otherTabs", {
                thisTab: thisTabHandler,
            });
        }).not.toThrow();

        expect(thisTabHandler).not.toHaveBeenCalled();
    });

    it("should handle empty handlers object", () => {
        expect(() => {
            tabScope("both", {});
        }).not.toThrow();
    });
});

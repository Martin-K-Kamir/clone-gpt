import { expect, waitFor } from "storybook/test";
import { fireEvent } from "storybook/test";

import {
    getAlertDialogDescription,
    getAlertDialogTitle,
    getAllButtonsByText,
    getAllCharacteristicButtons,
    getAllMenuItems,
    getAllSearchItems,
    getAllSelectOptions,
    getAllSkeletons,
    getButtonByText,
    getButtonInDialog,
    getDropdownMenuCheckboxItemByText,
    getDropdownMenuRadioItemByText,
    getDropdownMenuSubTrigger,
    getHighlightedDropdownMenuCheckboxItem,
    getHighlightedDropdownMenuItem,
    getHighlightedDropdownMenuRadioItem,
    getLinkByText,
    getMenuItemByText,
    getSelectItemByText,
} from "./elements";

export async function waitForElement(
    selector: string,
    options?: { timeout?: number },
): Promise<HTMLElement> {
    return waitFor(() => {
        const element = document.querySelector(selector);
        if (!element) {
            throw new Error(`Element not found: ${selector}`);
        }
        return element as HTMLElement;
    }, options);
}

export async function waitForElementToDisappear(
    selector: string,
    options?: { timeout?: number },
): Promise<void> {
    return waitFor(() => {
        const element = document.querySelector(selector);
        if (element) {
            throw new Error(`Element still present: ${selector}`);
        }
    }, options);
}

export async function waitForDialog(
    role: "dialog" | "alertdialog" = "dialog",
    options?: { timeout?: number },
): Promise<HTMLElement> {
    return waitForElement(`[role="${role}"]`, options);
}

export async function waitForDialogToClose(
    role: "dialog" | "alertdialog" = "dialog",
    options?: { timeout?: number },
): Promise<void> {
    return waitForElementToDisappear(`[role="${role}"]`, options);
}

export async function waitForSheetContent(options?: {
    timeout?: number;
}): Promise<HTMLElement> {
    return waitForElement('[data-slot="sheet-content"]', options);
}

export async function waitForSheetOverlay(options?: {
    timeout?: number;
}): Promise<HTMLElement> {
    return waitForElement('[data-slot="sheet-overlay"]', options);
}

export async function waitForSheetContentToClose(options?: {
    timeout?: number;
}): Promise<void> {
    return waitForElementToDisappear(
        '[data-slot="sheet-content"][data-state="open"]',
        options,
    );
}

export async function waitForDropdownMenu(options?: {
    timeout?: number;
}): Promise<HTMLElement> {
    return waitForElement('[data-slot="dropdown-menu-content"]', options);
}

export async function waitForDropdownMenuToClose(options?: {
    timeout?: number;
}): Promise<void> {
    return waitForElementToDisappear(
        '[data-slot="dropdown-menu-content"]',
        options,
    );
}

export async function waitForTooltip(options?: {
    timeout?: number;
}): Promise<HTMLElement> {
    return waitForElement('[data-slot="tooltip-content"]', options);
}

export async function waitForDialogOverlay(options?: {
    timeout?: number;
}): Promise<HTMLElement> {
    return waitForElement('[data-testid="dialog-overlay"]', options);
}

export async function waitForDialogCloseButton(options?: {
    timeout?: number;
}): Promise<HTMLElement> {
    return waitForElement('[data-slot="dialog-close"]', options);
}

export async function waitForDialogTitle(options?: {
    timeout?: number;
}): Promise<HTMLElement> {
    return waitForElement('[data-slot="dialog-title"]', options);
}

export async function waitForText(
    canvas: { getByText: (text: string | RegExp) => HTMLElement },
    text: string | RegExp,
    options?: { timeout?: number },
): Promise<HTMLElement> {
    return waitFor(() => {
        return canvas.getByText(text);
    }, options);
}

export async function waitForTestId(
    canvas: { getByTestId: (testId: string) => HTMLElement },
    testId: string,
    options?: { timeout?: number },
): Promise<HTMLElement> {
    return waitFor(() => {
        const element = canvas.getByTestId(testId);
        expect(element).toBeVisible();
        return element;
    }, options);
}

export async function clickAndWait(
    element: HTMLElement,
    userEvent: any,
    waitCondition: () => Promise<void> | void,
): Promise<void> {
    await userEvent.click(element);
    await waitCondition();
}

export async function typeAndWait(
    input: HTMLElement,
    text: string,
    userEvent: any,
    waitCondition?: () => Promise<void> | void,
): Promise<void> {
    await userEvent.type(input, text);
    if (waitCondition) {
        await waitCondition();
    }
}

export async function clickLinkAndVerify(
    link: HTMLElement,
    userEvent: any,
    expectedHref?: string,
): Promise<void> {
    if (expectedHref) {
        expect(link).toHaveAttribute("href", expectedHref);
    }

    let clicked = false;
    link.addEventListener(
        "click",
        e => {
            e.preventDefault();
            clicked = true;
        },
        { once: true },
    );

    await userEvent.click(link);
    expect(clicked).toBe(true);
}

export async function waitForButtonByRole(
    canvas: {
        getByRole: (
            role: string,
            options?: { name?: string | RegExp },
        ) => HTMLElement;
    },
    name: string | RegExp,
    options?: { timeout?: number },
): Promise<HTMLElement> {
    const { timeout } = options || {};
    return waitFor(
        () => {
            const button = canvas.getByRole("button", { name });
            expect(button).toBeInTheDocument();
            expect(button).toBeEnabled();
            return button;
        },
        { timeout },
    );
}

export function findButtonByText(text: string | RegExp): HTMLButtonElement {
    const buttons = Array.from(document.querySelectorAll("button"));
    if (typeof text === "string") {
        const button =
            buttons.find(button => button.textContent?.trim() === text) || null;
        if (!button) {
            throw new Error(`Button with text "${text}" not found`);
        }
        return button;
    }
    const button =
        buttons.find(button => text.test(button.textContent || "")) || null;
    if (!button) {
        throw new Error(`Button with text "${text}" not found`);
    }
    return button;
}

export function findInputByName(name: string): HTMLInputElement {
    const input = document.querySelector(`input[name="${name}"]`);
    if (!input) {
        throw new Error(`Input with name "${name}" not found`);
    }
    return input as HTMLInputElement;
}

export function findInputByType(type: string): HTMLInputElement | null {
    return document.querySelector(`input[type="${type}"]`);
}

export function findDropdownMenuItemByText(
    text: string | RegExp,
): HTMLElement | null {
    const items = Array.from(
        document.querySelectorAll<HTMLElement>(
            '[data-slot="dropdown-menu-item"]',
        ),
    );
    if (typeof text === "string") {
        return items.find(item => item.textContent?.includes(text)) || null;
    }
    return items.find(item => text.test(item.textContent || "")) || null;
}

export async function waitForDropdownMenuItemByText(
    text: string | RegExp,
    options?: { timeout?: number },
): Promise<HTMLElement> {
    return waitFor(() => {
        const item = findDropdownMenuItemByText(text);
        if (!item) {
            throw new Error(`Dropdown menu item with text "${text}" not found`);
        }
        return item;
    }, options);
}

export async function waitForMenuItemByText(
    text: string | RegExp,
    options?: { timeout?: number },
): Promise<HTMLElement> {
    return waitFor(() => {
        const item = getMenuItemByText(text);
        if (!item) {
            throw new Error(`Menu item with text "${text}" not found`);
        }
        return item;
    }, options);
}

export async function waitForMenuItems(options?: {
    timeout?: number;
}): Promise<HTMLElement[]> {
    return waitFor(() => {
        const items = getAllMenuItems();
        if (items.length === 0) {
            throw new Error("No menu items found");
        }
        return items;
    }, options);
}

export async function waitForSelectContent(options?: {
    timeout?: number;
}): Promise<HTMLElement> {
    return waitForElement('[data-slot="select-content"]', options);
}

export async function waitForSelectContentToClose(options?: {
    timeout?: number;
}): Promise<void> {
    return waitForElementToDisappear('[data-slot="select-content"]', options);
}

export async function waitForSelectItemByText(
    text: string | RegExp,
    options?: { timeout?: number },
): Promise<HTMLElement> {
    return waitFor(() => {
        const item = getSelectItemByText(text);
        if (!item) {
            throw new Error(`Select item with text "${text}" not found`);
        }
        return item;
    }, options);
}

export async function waitForSonnerToast(options?: {
    timeout?: number;
}): Promise<HTMLElement> {
    return waitForElement("[data-sonner-toast]", options);
}

export async function waitForSonnerToastToDisappear(options?: {
    timeout?: number;
}): Promise<void> {
    return waitForElementToDisappear("[data-sonner-toast]", options);
}

export async function waitForSonnerToastByType(
    type: string,
    options?: { timeout?: number },
): Promise<HTMLElement> {
    return waitForElement(`[data-sonner-toast][data-type="${type}"]`, options);
}

export async function waitForButtonByText(
    name: string | RegExp,
    options?: { timeout?: number },
): Promise<HTMLButtonElement> {
    return await waitFor(() => {
        const button = getButtonByText(name);
        expect(button).toBeInTheDocument();
        expect(button).toBeEnabled();
        return button;
    }, options);
}

export async function waitForAllButtonsByText(
    name: string | RegExp,
    options?: { timeout?: number },
): Promise<HTMLButtonElement[]> {
    return waitFor(() => {
        const buttons = getAllButtonsByText(name);
        expect(buttons.length).toBeGreaterThan(0);
        expect(buttons[0]).toBeInTheDocument();
        expect(buttons[0]).toBeEnabled();
        return buttons;
    }, options);
}

export async function waitForSwitch(
    checked?: boolean,
    options?: { timeout?: number },
): Promise<HTMLElement> {
    return waitFor(() => {
        const selector =
            checked !== undefined
                ? `[role="switch"][aria-checked="${checked}"]`
                : '[role="switch"]';
        const switchElement = document.querySelector<HTMLElement>(selector);
        if (!switchElement) {
            throw new Error(
                `Switch element${checked !== undefined ? ` with aria-checked="${checked}"` : ""} not found`,
            );
        }
        return switchElement;
    }, options);
}

export function findSocialShareButton(
    platform: "LinkedIn" | "Twitter" | "Reddit" | "Share",
): HTMLElement | null {
    const elements = Array.from(
        document.querySelectorAll<HTMLElement>("a, button"),
    );
    return (
        elements.find(element => {
            const srOnly = element.querySelector("span.sr-only");
            return (
                srOnly?.textContent === `Share on ${platform}` ||
                (platform === "Share" && srOnly?.textContent === "Share")
            );
        }) || null
    );
}

export async function waitForSocialShareButton(
    platform: "LinkedIn" | "Twitter" | "Reddit" | "Share",
    options?: { timeout?: number; shouldBeEnabled?: boolean },
): Promise<HTMLElement> {
    return waitFor(() => {
        const button = findSocialShareButton(platform);
        if (!button) {
            throw new Error(`Social share button for ${platform} not found`);
        }
        if (
            options?.shouldBeEnabled !== undefined &&
            options.shouldBeEnabled !== !button.hasAttribute("disabled")
        ) {
            throw new Error(
                `Social share button for ${platform} is not in expected state`,
            );
        }
        return button;
    }, options);
}

export async function waitForHighlightedDropdownMenuItem(options?: {
    timeout?: number;
}): Promise<HTMLElement> {
    return waitFor(() => {
        const item = getHighlightedDropdownMenuItem();
        if (!item) {
            throw new Error("Highlighted dropdown menu item not found");
        }
        return item;
    }, options);
}

export async function waitForDropdownMenuCheckboxItemByText(
    text: string | RegExp,
    options?: { timeout?: number },
): Promise<HTMLElement> {
    return waitFor(() => {
        const item = getDropdownMenuCheckboxItemByText(text);
        if (!item) {
            throw new Error(
                `Dropdown menu checkbox item with text "${text}" not found`,
            );
        }
        return item;
    }, options);
}

export async function waitForHighlightedDropdownMenuCheckboxItem(options?: {
    timeout?: number;
}): Promise<HTMLElement> {
    return waitFor(() => {
        const item = getHighlightedDropdownMenuCheckboxItem();
        if (!item) {
            throw new Error(
                "Highlighted dropdown menu checkbox item not found",
            );
        }
        return item;
    }, options);
}

export async function waitForDropdownMenuRadioItemByText(
    text: string | RegExp,
    options?: { timeout?: number },
): Promise<HTMLElement> {
    return waitFor(() => {
        const item = getDropdownMenuRadioItemByText(text);
        if (!item) {
            throw new Error(
                `Dropdown menu radio item with text "${text}" not found`,
            );
        }
        return item;
    }, options);
}

export async function waitForHighlightedDropdownMenuRadioItem(options?: {
    timeout?: number;
}): Promise<HTMLElement> {
    return waitFor(() => {
        const item = getHighlightedDropdownMenuRadioItem();
        if (!item) {
            throw new Error("Highlighted dropdown menu radio item not found");
        }
        return item;
    }, options);
}

export async function waitForDropdownMenuSubTrigger(options?: {
    timeout?: number;
}): Promise<HTMLElement> {
    return waitFor(() => {
        const trigger = getDropdownMenuSubTrigger();
        if (!trigger) {
            throw new Error("Dropdown menu sub trigger not found");
        }
        return trigger;
    }, options);
}

export async function waitForDropdownMenuSubContent(options?: {
    timeout?: number;
}): Promise<HTMLElement> {
    return waitForElement('[data-slot="dropdown-menu-sub-content"]', options);
}

export async function waitForDropdownMenuSubContentToClose(options?: {
    timeout?: number;
}): Promise<void> {
    return waitForElementToDisappear(
        '[data-slot="dropdown-menu-sub-content"]',
        options,
    );
}

export function expectAriaSelected(
    items: HTMLElement[],
    selectedIndex: number,
): void {
    items.forEach((item, index) => {
        if (index === selectedIndex) {
            expect(item).toHaveAttribute("aria-selected", "true");
        } else {
            expect(item).toHaveAttribute("aria-selected", "false");
        }
    });
}

export async function waitForAlertDialogTitle(options?: {
    timeout?: number;
}): Promise<HTMLElement> {
    return waitFor(() => {
        const title = getAlertDialogTitle();
        if (!title) {
            throw new Error("Alert dialog title not found");
        }
        return title;
    }, options);
}

export async function waitForAlertDialogDescription(options?: {
    timeout?: number;
}): Promise<HTMLElement> {
    return waitFor(() => {
        const description = getAlertDialogDescription();
        if (!description) {
            throw new Error("Alert dialog description not found");
        }
        return description;
    }, options);
}

export async function waitForSelectOptions(options?: {
    timeout?: number;
}): Promise<HTMLElement[]> {
    return waitFor(() => {
        const optionsList = getAllSelectOptions();
        if (optionsList.length === 0) {
            throw new Error("Select options not found");
        }
        return optionsList;
    }, options);
}

export async function waitForSkeletons(options?: {
    timeout?: number;
}): Promise<HTMLElement[]> {
    return waitFor(() => {
        const skeletons = getAllSkeletons();
        if (skeletons.length === 0) {
            throw new Error("Skeletons not found");
        }
        return skeletons;
    }, options);
}

export async function waitForSkeletonsToDisappear(options?: {
    timeout?: number;
}): Promise<void> {
    return waitFor(() => {
        const skeletons = getAllSkeletons();
        if (skeletons.length > 0) {
            throw new Error("Skeletons still present");
        }
    }, options);
}

export type DownloadMockOptions = {
    url: string;
    contentType?: string;
    blobContent?: string;
};

export type DownloadMockResult = {
    flags: {
        fetchCalled: boolean;
        downloadLinkCreated: boolean;
    };
    cleanup: () => void;
};

export function setupDownloadMock(
    options: DownloadMockOptions,
): DownloadMockResult {
    const {
        url,
        contentType = "application/octet-stream",
        blobContent = "test",
    } = options;

    const flags = {
        fetchCalled: false,
        downloadLinkCreated: false,
    };

    // Mock fetch to track if download was triggered
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL) => {
        if (typeof input === "string" && input === url) {
            flags.fetchCalled = true;
            return new Response(
                new Blob([blobContent], { type: contentType }),
                {
                    status: 200,
                    headers: { "Content-Type": contentType },
                },
            );
        }
        return originalFetch(input);
    };

    // Track if download link is created
    const originalCreateElement = document.createElement.bind(document);
    document.createElement = function (
        tagName: string,
        elementOptions?: ElementCreationOptions,
    ) {
        const element = originalCreateElement(tagName, elementOptions);
        if (tagName === "a") {
            flags.downloadLinkCreated = true;
            // Prevent actual download
            element.click = function () {
                // Mock click - don't actually download
            };
        }
        return element;
    };

    const cleanup = () => {
        window.fetch = originalFetch;
        document.createElement = originalCreateElement;
    };

    return {
        flags,
        cleanup,
    };
}

export type ClipboardMockResult = {
    flags: {
        clipboardWriteTextCalled: boolean;
        clipboardText: string;
    };
    cleanup: () => void;
};

export function setupClipboardMock(): ClipboardMockResult {
    const flags = {
        clipboardWriteTextCalled: false,
        clipboardText: "",
    };

    const originalWriteText = navigator.clipboard.writeText.bind(
        navigator.clipboard,
    );

    navigator.clipboard.writeText = async (text: string) => {
        flags.clipboardWriteTextCalled = true;
        flags.clipboardText = text;
        return originalWriteText(text);
    };

    const cleanup = () => {
        navigator.clipboard.writeText = originalWriteText;
    };

    return {
        flags,
        cleanup,
    };
}

export type ClipboardMockWithFallbackResult = {
    flags: {
        clipboardWriteCalled: boolean;
        clipboardWriteTextCalled: boolean;
        clipboardText: string;
    };
    cleanup: () => void;
};

export function setupClipboardMockWithFallback(options?: {
    makeWriteFail?: boolean;
}): ClipboardMockWithFallbackResult {
    const { makeWriteFail = false } = options || {};
    const flags = {
        clipboardWriteCalled: false,
        clipboardWriteTextCalled: false,
        clipboardText: "",
    };

    const originalWrite = navigator.clipboard.write.bind(navigator.clipboard);
    const originalWriteText = navigator.clipboard.writeText.bind(
        navigator.clipboard,
    );

    navigator.clipboard.write = async (data: ClipboardItems) => {
        flags.clipboardWriteCalled = true;
        if (makeWriteFail) {
            throw new Error("Clipboard write failed");
        }
        return originalWrite(data);
    };

    navigator.clipboard.writeText = async (text: string) => {
        flags.clipboardWriteTextCalled = true;
        flags.clipboardText = text;
        return originalWriteText(text);
    };

    const cleanup = () => {
        navigator.clipboard.write = originalWrite;
        navigator.clipboard.writeText = originalWriteText;
    };

    return {
        flags,
        cleanup,
    };
}

export type DownloadLinkTrackingResult = {
    flags: {
        downloadLinkCreated: boolean;
        downloadLinkClicked: boolean;
    };
    cleanup: () => void;
};

export async function swipeDismissElement(
    element: Element,
    options?: {
        swipeDistance?: number;
        direction?: "left" | "right" | "up" | "down";
        steps?: number;
    },
): Promise<void> {
    const {
        swipeDistance = 200,
        direction = "right",
        steps = 10,
    } = options || {};

    const rect = element.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    let deltaX = 0;
    let deltaY = 0;

    switch (direction) {
        case "right":
            deltaX = swipeDistance;
            break;
        case "left":
            deltaX = -swipeDistance;
            break;
        case "down":
            deltaY = swipeDistance;
            break;
        case "up":
            deltaY = -swipeDistance;
            break;
    }

    fireEvent.pointerDown(element, {
        clientX: startX,
        clientY: startY,
        pointerId: 1,
        pointerType: "mouse",
    });

    for (let i = 1; i <= steps; i++) {
        fireEvent.pointerMove(element, {
            clientX: startX + (deltaX * i) / steps,
            clientY: startY + (deltaY * i) / steps,
            pointerId: 1,
            pointerType: "mouse",
        });
    }

    fireEvent.pointerUp(element, {
        clientX: startX + deltaX,
        clientY: startY + deltaY,
        pointerId: 1,
        pointerType: "mouse",
    });
}

export function setupDownloadLinkTracking(): DownloadLinkTrackingResult {
    const flags = {
        downloadLinkCreated: false,
        downloadLinkClicked: false,
    };

    const originalCreateElement = document.createElement.bind(document);
    document.createElement = function (
        tagName: string,
        elementOptions?: ElementCreationOptions,
    ) {
        const element = originalCreateElement(tagName, elementOptions);
        if (tagName === "a") {
            flags.downloadLinkCreated = true;
            // Mock click to prevent actual download
            element.click = function () {
                flags.downloadLinkClicked = true;
                // Don't call original click to prevent actual download
            };
        }
        return element;
    };

    const cleanup = () => {
        document.createElement = originalCreateElement;
    };

    return {
        flags,
        cleanup,
    };
}

export async function waitForScrollToBottom(
    container: HTMLElement,
    options?: { timeout?: number; threshold?: number },
): Promise<void> {
    const { timeout = 2000, threshold = 10 } = options || {};
    return waitFor(
        () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            const isAtBottom =
                Math.abs(scrollHeight - scrollTop - clientHeight) < threshold;
            expect(isAtBottom).toBe(true);
        },
        { timeout },
    );
}

export async function waitForScrollButton(
    canvas: {
        getByRole: (
            role: string,
            options?: { name?: string | RegExp },
        ) => HTMLElement;
        queryByRole: (
            role: string,
            options?: { name?: string | RegExp },
        ) => HTMLElement | null;
    },
    buttonText: string | RegExp,
    options?: { timeout?: number; checkClickable?: boolean },
): Promise<HTMLElement> {
    const { timeout = 2000, checkClickable = false } = options || {};
    return waitFor(
        () => {
            const button = canvas.getByRole("button", {
                name:
                    typeof buttonText === "string"
                        ? new RegExp(buttonText, "i")
                        : buttonText,
            });
            expect(button).toBeInTheDocument();
            expect(button).toBeEnabled();

            if (checkClickable) {
                const computedStyle = window.getComputedStyle(button);
                expect(computedStyle.pointerEvents).not.toBe("none");
                expect(computedStyle.opacity).not.toBe("0");
            }

            return button;
        },
        { timeout },
    );
}

export async function waitForSearchItems(options?: {
    minCount?: number;
    timeout?: number;
}): Promise<HTMLElement[]> {
    const { minCount = 1, timeout } = options || {};
    return waitFor(
        () => {
            const items = getAllSearchItems();
            expect(items.length).toBeGreaterThanOrEqual(minCount);
            return items;
        },
        { timeout },
    );
}

export async function waitForLinkByText(
    text: string | RegExp,
    options?: { timeout?: number; exact?: boolean },
): Promise<HTMLAnchorElement> {
    const { timeout, exact } = options || {};
    return waitFor(
        () => {
            const link = getLinkByText(text, { exact });
            if (!link) {
                throw new Error(
                    `Link with text "${text}"${exact ? " (exact match)" : ""} not found`,
                );
            }
            expect(link).toBeInTheDocument();
            return link;
        },
        { timeout },
    );
}

export async function waitForButtonInDialog(
    dialog: HTMLElement,
    buttonText: string | RegExp,
    options?: { timeout?: number },
): Promise<HTMLButtonElement> {
    const { timeout } = options || {};
    return waitFor(
        () => {
            const button = getButtonInDialog(dialog, buttonText);
            if (!button) {
                throw new Error(
                    `Button with text "${buttonText}" not found in dialog`,
                );
            }
            expect(button).toBeInTheDocument();
            return button;
        },
        { timeout },
    );
}

export async function waitForCharacteristicButtons(options?: {
    minCount?: number;
    timeout?: number;
}): Promise<HTMLElement[]> {
    const { minCount = 1, timeout } = options || {};
    return waitFor(
        () => {
            const buttons = getAllCharacteristicButtons();
            expect(buttons.length).toBeGreaterThanOrEqual(minCount);
            return buttons;
        },
        { timeout },
    );
}

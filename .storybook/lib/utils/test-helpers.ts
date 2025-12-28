import { waitFor } from "storybook/test";

import { getSelectItemByText } from "./elements";

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

export function findMenuItemByText(text: string | RegExp): HTMLElement | null {
    const items = Array.from(
        document.querySelectorAll<HTMLElement>("[role='menuitem']"),
    );
    if (typeof text === "string") {
        return items.find(item => item.textContent?.includes(text)) || null;
    }
    return items.find(item => text.test(item.textContent || "")) || null;
}

export async function waitForMenuItemByText(
    text: string | RegExp,
    options?: { timeout?: number },
): Promise<HTMLElement> {
    return waitFor(() => {
        const item = findMenuItemByText(text);
        if (!item) {
            throw new Error(`Menu item with text "${text}" not found`);
        }
        return item;
    }, options);
}

export function getAllMenuItems(): HTMLElement[] {
    return Array.from(
        document.querySelectorAll<HTMLElement>("[role='menuitem']"),
    );
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

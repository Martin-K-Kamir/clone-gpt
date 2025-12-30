export function getDialog(
    role: "dialog" | "alertdialog" = "dialog",
): HTMLElement | null {
    return document.querySelector(`[role="${role}"]`);
}

export function getDialogOverlay(): HTMLElement | null {
    return document.querySelector('[data-testid="dialog-overlay"]');
}

export function getDialogCloseButton(): HTMLElement | null {
    return document.querySelector('[data-slot="dialog-close"]');
}

export function getDialogTitle(): HTMLElement | null {
    return document.querySelector('[data-slot="dialog-title"]');
}

export function getAlertDialogTitle(): HTMLElement | null {
    return document.querySelector('[data-slot="alert-dialog-title"]');
}

export function getAlertDialogDescription(): HTMLElement | null {
    return document.querySelector('[data-slot="alert-dialog-description"]');
}

export function getDropdownMenu(): HTMLElement | null {
    return document.querySelector('[data-slot="dropdown-menu-content"]');
}

export function getTooltip(): HTMLElement | null {
    return document.querySelector('[data-slot="tooltip-content"]');
}

export function getInputPlaceholderText(): string {
    const inputElement = document.querySelector('[data-slot="input"]');
    const parentContainer = inputElement?.parentElement;
    const placeholderWrapper = parentContainer?.querySelector(
        ".pointer-events-none.absolute",
    );
    const span = placeholderWrapper?.querySelector("span");
    return span?.textContent?.trim() || "";
}

export function getSelectContent(): HTMLElement | null {
    return document.querySelector('[data-slot="select-content"]');
}

export function getSelectItemByText(text: string | RegExp): HTMLElement | null {
    const items = Array.from(
        document.querySelectorAll<HTMLElement>('[data-slot="select-item"]'),
    );
    if (typeof text === "string") {
        return items.find(item => item.textContent?.includes(text)) || null;
    }
    return items.find(item => text.test(item.textContent || "")) || null;
}

export function getCheckedSelectItem(): HTMLElement | null {
    return document.querySelector<HTMLElement>(
        '[data-slot="select-item"][data-state="checked"]',
    );
}

export function getAllSelectOptions(): HTMLElement[] {
    return Array.from(
        document.querySelectorAll<HTMLElement>("div[role='option']"),
    );
}

export function getAllSkeletons(): HTMLElement[] {
    return Array.from(
        document.querySelectorAll<HTMLElement>('[data-testid="skeleton"]'),
    );
}

export function getMenuItemByText(text: string | RegExp): HTMLElement | null {
    const items = Array.from(
        document.querySelectorAll<HTMLElement>('[role="menuitem"]'),
    );
    if (typeof text === "string") {
        return items.find(item => item.textContent?.includes(text)) || null;
    }
    return items.find(item => text.test(item.textContent || "")) || null;
}

export function getAllMenuItems(): HTMLElement[] {
    return Array.from(
        document.querySelectorAll<HTMLElement>('[role="menuitem"]'),
    );
}

export function hasMenuItemWithText(text: string | RegExp): boolean {
    return getMenuItemByText(text) !== null;
}

export function getFileInput(): HTMLInputElement {
    const fileInput =
        document.querySelector<HTMLInputElement>('input[type="file"]');
    if (!fileInput) {
        throw new Error("File input not found");
    }

    return fileInput;
}

export function getSonnerToast(): HTMLElement | null {
    return document.querySelector("[data-sonner-toast]");
}

export function getAllSonnerToasts(): HTMLElement[] {
    return Array.from(
        document.querySelectorAll<HTMLElement>("[data-sonner-toast]"),
    );
}

export function getSonnerToastByType(type: string): HTMLElement | null {
    return document.querySelector(`[data-sonner-toast][data-type="${type}"]`);
}

export function getElementsByText<T extends HTMLElement>(
    selector: string,
    text: string | RegExp,
): T {
    const elements = document.querySelectorAll(selector);
    if (typeof text === "string") {
        const foundElement = Array.from(elements).find(element =>
            element.textContent?.includes(text),
        );
        if (!foundElement) {
            throw new Error(`Element with text "${text}" not found`);
        }
        return foundElement as T;
    }
    const foundElement = Array.from(elements).find(element =>
        text.test(element.textContent || ""),
    );
    if (!foundElement) {
        throw new Error(`Element with text "${text}" not found`);
    }
    return foundElement as T;
}

export function getForm(): HTMLFormElement | null {
    return document.querySelector("form");
}

export function getMenu(): HTMLElement | null {
    return document.querySelector('[role="menu"]');
}

export function getButtonByText(text: string | RegExp): HTMLButtonElement {
    const buttons = Array.from(
        document.querySelectorAll<HTMLButtonElement>("button"),
    );
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

export function getAllButtonsByText(
    text: string | RegExp,
): HTMLButtonElement[] {
    const buttons = Array.from(
        document.querySelectorAll<HTMLButtonElement>("button"),
    );
    if (typeof text === "string") {
        return buttons.filter(button => button.textContent?.trim() === text);
    }
    return buttons.filter(button => text.test(button.textContent || ""));
}
export function getElementByTestId(testId: string): HTMLElement | null {
    return document.querySelector(`[data-testid="${testId}"]`);
}

export function getAllDropdownMenuItems(): HTMLElement[] {
    return Array.from(
        document.querySelectorAll<HTMLElement>(
            '[data-slot="dropdown-menu-item"]',
        ),
    );
}

export function getDropdownMenuItemByText(
    text: string | RegExp,
): HTMLElement | null {
    const items = getAllDropdownMenuItems();
    if (typeof text === "string") {
        return items.find(item => item.textContent?.includes(text)) || null;
    }
    return items.find(item => text.test(item.textContent || "")) || null;
}

export function getHighlightedDropdownMenuItem(): HTMLElement | null {
    return document.querySelector<HTMLElement>(
        '[data-slot="dropdown-menu-item"][data-highlighted]',
    );
}

export function getAllDropdownMenuCheckboxItems(): HTMLElement[] {
    return Array.from(
        document.querySelectorAll<HTMLElement>(
            '[data-slot="dropdown-menu-checkbox-item"]',
        ),
    );
}

export function getDropdownMenuCheckboxItemByText(
    text: string | RegExp,
): HTMLElement | null {
    const items = getAllDropdownMenuCheckboxItems();
    if (typeof text === "string") {
        return items.find(item => item.textContent?.includes(text)) || null;
    }
    return items.find(item => text.test(item.textContent || "")) || null;
}

export function getHighlightedDropdownMenuCheckboxItem(): HTMLElement | null {
    return document.querySelector<HTMLElement>(
        '[data-slot="dropdown-menu-checkbox-item"][data-highlighted]',
    );
}

export function getAllDropdownMenuRadioItems(): HTMLElement[] {
    return Array.from(
        document.querySelectorAll<HTMLElement>(
            '[data-slot="dropdown-menu-radio-item"]',
        ),
    );
}

export function getDropdownMenuRadioItemByText(
    text: string | RegExp,
): HTMLElement | null {
    const items = getAllDropdownMenuRadioItems();
    if (typeof text === "string") {
        return items.find(item => item.textContent?.includes(text)) || null;
    }
    return items.find(item => text.test(item.textContent || "")) || null;
}

export function getHighlightedDropdownMenuRadioItem(): HTMLElement | null {
    return document.querySelector<HTMLElement>(
        '[data-slot="dropdown-menu-radio-item"][data-highlighted]',
    );
}

export function getDropdownMenuSubTrigger(): HTMLElement | null {
    return document.querySelector<HTMLElement>(
        '[data-slot="dropdown-menu-sub-trigger"]',
    );
}

export function getDropdownMenuSubContent(): HTMLElement | null {
    return document.querySelector<HTMLElement>(
        '[data-slot="dropdown-menu-sub-content"]',
    );
}

export function getCodeBlockByLanguage(language: string): HTMLElement | null {
    return document.querySelector<HTMLElement>(`.language-${language}`);
}

export function getSheetContent(): HTMLElement | null {
    return document.querySelector<HTMLElement>('[data-slot="sheet-content"]');
}

export function getSheetOverlay(): HTMLElement | null {
    return document.querySelector<HTMLElement>('[data-slot="sheet-overlay"]');
}

export function getSheetCloseButton(
    text?: string | RegExp,
): HTMLElement | null {
    if (!text) {
        const buttons = Array.from(
            document.querySelectorAll<HTMLElement>("button"),
        );
        return (
            buttons.find(btn =>
                btn.textContent?.toLowerCase().includes("close"),
            ) || null
        );
    }
    const buttons = Array.from(
        document.querySelectorAll<HTMLElement>("button"),
    );
    if (typeof text === "string") {
        return buttons.find(btn => btn.textContent?.includes(text)) || null;
    }
    return buttons.find(btn => text.test(btn.textContent || "")) || null;
}

export function getScrollContainer(): HTMLElement {
    const container = document.querySelector<HTMLElement>(
        '[class*="overflow-y-auto"]',
    );
    if (!container) {
        throw new Error("Scroll container not found");
    }
    return container;
}

export function isScrolledToBottom(
    container: HTMLElement,
    threshold = 10,
): boolean {
    const { scrollTop, scrollHeight, clientHeight } = container;
    return Math.abs(scrollHeight - scrollTop - clientHeight) < threshold;
}

export function getAllSearchItems(): HTMLElement[] {
    return Array.from(
        document.querySelectorAll<HTMLElement>('[data-slot="search-item"]'),
    );
}

export function getSidebar(): HTMLElement | null {
    return document.querySelector<HTMLElement>('[data-slot="sidebar"]');
}

export function getLinkByText(
    text: string | RegExp,
    options?: { exact?: boolean },
): HTMLAnchorElement | null {
    const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("a"));
    const { exact = false } = options || {};

    if (typeof text === "string") {
        return (
            links.find(link =>
                exact
                    ? link.textContent?.trim() === text
                    : link.textContent?.includes(text),
            ) || null
        );
    }
    return links.find(link => text.test(link.textContent || "")) || null;
}

export function getButtonInDialog(
    dialog: Element | null,
    buttonText: string | RegExp,
): HTMLButtonElement | null {
    if (!dialog) {
        return null;
    }

    const buttons = Array.from(
        dialog.querySelectorAll<HTMLButtonElement>("button"),
    );

    if (typeof buttonText === "string") {
        return (
            buttons.find(button => button.textContent?.trim() === buttonText) ||
            null
        );
    }
    return (
        buttons.find(button => buttonText.test(button.textContent || "")) ||
        null
    );
}

export function getAllCharacteristicButtons(): HTMLElement[] {
    return Array.from(
        document.querySelectorAll<HTMLElement>(
            "[data-testid^='user-chat-preference-form-characteristic-button-']",
        ),
    );
}

export function getAllButtonsInElement(
    element: Element | null,
): HTMLButtonElement[] {
    if (!element) {
        return [];
    }
    return Array.from(element.querySelectorAll<HTMLButtonElement>("button"));
}

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

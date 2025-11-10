// Function that removes punctuation marks and special characters from a string
export function removePunctuation(str: string): string {
    return str.replace(/[^\w\s]/g, "");
}

// More comprehensive version that handles various punctuation types
export function removePunctuationAdvanced(str: string): string {
    return str.replace(/[^\p{L}\p{N}\s]/gu, "");
}

// Version that only removes common punctuation but keeps letters, numbers, and spaces
export function removePunctuationOnly(str: string): string {
    return str.replace(/[.,!?;:'"()[\]{}<>@#$%^&*+=|\\~`]/g, "");
}

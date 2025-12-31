import { generateSizeNumber } from "@/lib/utils/generate-size-number";

export function generateSizePercentage(index: number, min = 60, max = 100) {
    const sizeNumber = generateSizeNumber(index, min, max);
    return `${sizeNumber}%`;
}

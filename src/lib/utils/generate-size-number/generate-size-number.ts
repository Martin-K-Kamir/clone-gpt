export function generateSizeNumber(index: number, min = 1, max = 18) {
    const pseudoRandom = Math.sin(index + 1) * 10000;
    const normalized = Math.abs(pseudoRandom % 1);
    return Math.floor(normalized * (max - min) + min);
}

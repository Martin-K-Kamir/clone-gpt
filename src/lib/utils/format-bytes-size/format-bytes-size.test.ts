import { describe, expect, it } from "vitest";

import { formatBytesSize } from "./format-bytes-size";

describe("formatBytesSize", () => {
    it("should return '0 B' for 0 bytes", () => {
        expect(formatBytesSize(0)).toBe("0 B");
    });

    it("should format bytes less than 1 KB", () => {
        expect(formatBytesSize(1)).toBe("1 B");
        expect(formatBytesSize(100)).toBe("100 B");
        expect(formatBytesSize(512)).toBe("512 B");
        expect(formatBytesSize(1023)).toBe("1023 B");
    });

    it("should format kilobytes", () => {
        expect(formatBytesSize(1024)).toBe("1 KB");
        expect(formatBytesSize(2048)).toBe("2 KB");
        expect(formatBytesSize(5120)).toBe("5 KB");
        expect(formatBytesSize(10240)).toBe("10 KB");
    });

    it("should format megabytes", () => {
        expect(formatBytesSize(1048576)).toBe("1 MB");
        expect(formatBytesSize(2097152)).toBe("2 MB");
        expect(formatBytesSize(5242880)).toBe("5 MB");
        expect(formatBytesSize(10485760)).toBe("10 MB");
    });

    it("should format gigabytes", () => {
        expect(formatBytesSize(1073741824)).toBe("1 GB");
        expect(formatBytesSize(2147483648)).toBe("2 GB");
        expect(formatBytesSize(5368709120)).toBe("5 GB");
    });

    it("should handle decimal values for KB", () => {
        expect(formatBytesSize(1536)).toBe("1.5 KB");
        expect(formatBytesSize(2560)).toBe("2.5 KB");
        expect(formatBytesSize(5120)).toBe("5 KB");
    });

    it("should handle decimal values for MB", () => {
        expect(formatBytesSize(1572864)).toBe("1.5 MB");
        expect(formatBytesSize(2621440)).toBe("2.5 MB");
        expect(formatBytesSize(5242880)).toBe("5 MB");
    });

    it("should handle decimal values for GB", () => {
        expect(formatBytesSize(1610612736)).toBe("1.5 GB");
        expect(formatBytesSize(2684354560)).toBe("2.5 GB");
    });

    it("should round to one decimal place", () => {
        expect(formatBytesSize(1536)).toBe("1.5 KB");
        expect(formatBytesSize(1537)).toBe("1.5 KB");
        expect(formatBytesSize(1538)).toBe("1.5 KB");
        expect(formatBytesSize(1540)).toBe("1.5 KB");
    });

    it("should handle values just below unit thresholds", () => {
        expect(formatBytesSize(1023)).toBe("1023 B");
        expect(formatBytesSize(1048575)).toBe("1024 KB");
        expect(formatBytesSize(1073741823)).toBe("1024 MB");
    });

    it("should handle large values", () => {
        expect(formatBytesSize(10737418240)).toBe("10 GB");
        expect(formatBytesSize(21474836480)).toBe("20 GB");
    });

    it("should handle values between units", () => {
        expect(formatBytesSize(1500)).toBe("1.5 KB");
        expect(formatBytesSize(1500000)).toBe("1.4 MB");
        expect(formatBytesSize(1500000000)).toBe("1.4 GB");
    });
});

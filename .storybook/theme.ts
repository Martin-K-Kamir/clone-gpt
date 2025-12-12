import { create } from "storybook/theming/create";

export default create({
    base: "dark",
    brandTitle: "CloneGPT",

    //
    colorPrimary: "#3A10E5",
    colorSecondary: "#585C6D",

    // UI
    appBg: "#09090b",
    appContentBg: "#09090b",
    appPreviewBg: "#101013",
    appBorderColor: "#27272a",
    appBorderRadius: 8,

    // Text colors
    textColor: "#fafafa",
    textInverseColor: "#ff0000",

    // Toolbar default and active colors
    barTextColor: "#fafafa",
    barSelectedColor: "#60a5fa",
    barHoverColor: "#60a5fa",
    barBg: "#09090b",

    // Form colors
    inputBg: "#18181b",
    inputBorder: "#27272a",
    inputTextColor: "#fafafa",
    inputBorderRadius: 8,

    booleanSelectedBg: "#3b82f6",
    appHoverBg: "#18181b",
    textMutedColor: "#a1a1aa",
});

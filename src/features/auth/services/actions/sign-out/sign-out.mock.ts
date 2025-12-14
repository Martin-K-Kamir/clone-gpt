import { fn } from "storybook/test";

export const signOut = fn(async (redirectTo = "/logout") => {
    console.log("[Storybook Mock] signOut called", { redirectTo });
}).mockName("signOut");

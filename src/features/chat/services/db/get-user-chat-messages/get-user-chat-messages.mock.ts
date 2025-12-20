import { fn } from "storybook/test";

export const getUserChatMessages = fn().mockName("getUserChatMessages");
export const uncachedGetUserChatMessages = fn().mockName(
    "uncachedGetUserChatMessages",
);

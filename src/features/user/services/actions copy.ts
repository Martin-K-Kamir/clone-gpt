// "use server";

// import z from "zod";

// import { assertSessionExists } from "@/features/auth/lib/asserts";
// import { auth } from "@/features/auth/services/auth";

// import { assertIsUserChatPreferences } from "@/features/user/lib/asserts";
// import { userChatPreferenceSchema } from "@/features/user/lib/schemas";

// import { api } from "@/lib/api-response";
// import { assertIsNonEmptyString } from "@/lib/asserts";
// import type { WithNewName } from "@/lib/types";
// import { handleApiError } from "@/lib/utils/handle-api-error";

// import {
//     deleteUser as _deleteUser,
//     updateUserName as _updateUserName,
//     upsertUserChatPreferences as _upsertUserChatPreferences,
// } from "./db";

// export async function updateUserName({ newName }: WithNewName) {
//     try {
//         const session = await auth();
//         assertSessionExists(session);
//         assertIsNonEmptyString(newName);

//         const user = await _updateUserName({
//             newName,
//             userId: session.user.id,
//         });

//         if (!user) {
//             return api.error.user.notFound();
//         }

//         return api.success.user.updateName(user.name);
//     } catch (error) {
//         return handleApiError(error, () => api.error.user.updateName(error));
//     }
// }

// export async function deleteUser() {
//     try {
//         const session = await auth();
//         assertSessionExists(session);
//         const userId = session.user.id;

//         const user = await _deleteUser({ userId });

//         if (!user) {
//             return api.error.user.notFound();
//         }

//         return api.success.user.delete(user);
//     } catch (error) {
//         return handleApiError(error, () => api.error.user.delete(error));
//     }
// }

// export async function upsertUserChatPreferences({
//     userChatPreferences,
// }: {
//     userChatPreferences: z.infer<typeof userChatPreferenceSchema>;
// }) {
//     try {
//         const session = await auth();
//         assertSessionExists(session);
//         assertIsUserChatPreferences(userChatPreferences);

//         const result = await _upsertUserChatPreferences({
//             userChatPreferences,
//             userId: session.user.id,
//         });

//         if (!result) {
//             return api.error.user.notFound();
//         }

//         return api.success.user.updateChatPreferences(result);
//     } catch (error) {
//         return handleApiError(error, () =>
//             api.error.user.updateChatPreferences(error),
//         );
//     }
// }

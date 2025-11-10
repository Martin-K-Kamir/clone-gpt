import {
    AuthenticationError,
    SessionInvalidError,
} from "@/features/auth/lib/classes";
import { sessionSchema } from "@/features/auth/lib/schemas";
import { Session } from "@/features/auth/lib/types";

export function assertSessionExists(
    session: unknown,
): asserts session is Session {
    if (!session) {
        throw new AuthenticationError();
    }

    const result = sessionSchema.safeParse(session);

    if (!result.success) {
        throw new SessionInvalidError({ issues: result.error.issues });
    }
}

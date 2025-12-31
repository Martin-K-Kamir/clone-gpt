import { SafeParseError } from "zod";

export function getParseErrors<TInput>(result: SafeParseError<TInput>) {
    return result.error.errors.map(error => error.message);
}

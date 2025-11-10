import { Tool, tool } from "ai";
import { z } from "zod";

const inputSchema = z.object({
    city: z.string(),
});

export type GetLocationTool = Tool<{
    input: string;
    output: string | null;
}>;

export const getLocation = tool({
    inputSchema,
    description: "Get the user location.",
});

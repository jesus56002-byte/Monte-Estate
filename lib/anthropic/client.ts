import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { env } from "@/lib/env";

/** Server-only singleton. Never import this from a client component. */
export const anthropic = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
});

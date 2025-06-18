import { RateLimiter, HOUR } from "@convex-dev/rate-limiter";
import { components } from "./_generated/api";

export const rateLimiter = new RateLimiter(components.rateLimiter, {
  llmChatGuest: { kind: "token bucket", rate: 5, period: 24 * HOUR, },
  llmChatUser: { kind: "token bucket", rate: 20, period: 24 * HOUR, },
});

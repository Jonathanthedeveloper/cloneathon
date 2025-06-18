// convex/convex.config.ts
import { defineApp } from "convex/server";
import persistentTextStreaming from "@convex-dev/persistent-text-streaming/convex.config";
import rateLimiter from "@convex-dev/rate-limiter/convex.config";

const app = defineApp();
app.use(persistentTextStreaming);
app.use(rateLimiter);

export default app;

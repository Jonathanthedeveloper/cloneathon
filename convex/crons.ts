import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "sync-openrouter-models",
  { hours: 24 },
  internal.functions.openrouter.syncModels
);

export default crons;
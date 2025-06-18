import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
    handler: async (ctx) => {
        const userId = getAuthUserId(ctx);


        if (!userId) {
            throw new Error("Unauthorized: User must be logged in to generate an upload URL.");
        }

        const { storage } = ctx;
        // Generate a signed URL for uploading a file to the storage bucket
        const url = await storage.generateUploadUrl();
        return url;
    }
})

export const deleteById = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.delete(args.storageId);
  },
});
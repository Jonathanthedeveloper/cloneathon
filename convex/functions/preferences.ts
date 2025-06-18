import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

export const getPreference = query({
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);

        const preference = await ctx.db.query("preferences")
            .filter((q) => q.eq(q.field("userId"), userId))
            .first()

        if (!preference) {
            return {
                nickName: "",
                occupation: "",
                aiTraits: "",
                bio: ""
            };
        }

        return preference;
    }
})

export const updatePreference = mutation({
    args: {
        nickName: v.optional(v.string()),
        occupation: v.optional(v.string()),
        aiTraits: v.optional(v.string()),
        bio: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        if (!userId) {
            throw new Error("User not authenticated");
        }

        const existingPreference = await ctx.db.query("preferences")
            .filter((q) => q.eq(q.field("userId"), userId))
            .first();

        if (existingPreference) {
            return await ctx.db.patch(existingPreference._id, args);
        } else {
            return await ctx.db.insert("preferences", {
                userId,
                ...args
            });
        }
    }
});
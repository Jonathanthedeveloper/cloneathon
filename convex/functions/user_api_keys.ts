import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    providerId: v.id("modelProviders"),
    key: v.string(),
  },
  handler: async (ctx, args) => {

    const userId = await getAuthUserId(ctx);

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Check if user API key already exists for this provider
    const existing = await ctx.db
      .query("userApiKeys")
      .withIndex("byUserAndProvider", (q) =>
        q.eq("userId", userId).eq("providerId", args.providerId)
      )
      .first();

    if (existing)
      // Update existing key
      return await ctx.db.patch(existing._id, {
        key: args.key,
      });



    // Create new key
    return await ctx.db.insert("userApiKeys", {
      userId: userId,
      providerId: args.providerId,
      key: args.key,
    });

  },
});

// Get all user API keys for a user
export const list = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);

    if (!userId) {
      return [];
    }


    return await ctx.db
      .query("userApiKeys")
      .withIndex("byUserAndProvider", (q) => q.eq("userId", userId))
      .collect();
  },
});

// Get user API key by user and provider
export const getByUserAndProvider = query({
  args: {
    providerId: v.id("modelProviders"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    return await ctx.db
      .query("userApiKeys")
      .withIndex("byUserAndProvider", (q) =>
        q.eq("userId", userId).eq("providerId", args.providerId)
      )
      .first();
  },
});

// Get a specific user API key
export const get = query({
  args: { id: v.id("userApiKeys") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Update user API key
export const update = mutation({
  args: {
    id: v.id("userApiKeys"),
    key: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      key: args.key,
    });
  },
});

// Delete user API key
export const remove = mutation({
  args: { id: v.id("userApiKeys") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

// Delete user API key by user and provider
export const removeByUserAndProvider = mutation({
  args: {
    userId: v.id("users"),
    providerId: v.id("modelProviders"),
  },
  handler: async (ctx, args) => {
    const userApiKey = await ctx.db
      .query("userApiKeys")
      .withIndex("byUserAndProvider", (q) =>
        q.eq("userId", args.userId).eq("providerId", args.providerId)
      )
      .first();

    if (userApiKey) {
      await ctx.db.delete(userApiKey._id);
    }

    return userApiKey;
  },
});

// Delete all user API keys for a user
export const removeAllByUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const userApiKeys = await ctx.db
      .query("userApiKeys")
      .withIndex("byUserAndProvider", (q) => q.eq("userId", args.userId))
      .collect();

    for (const userApiKey of userApiKeys) {
      await ctx.db.delete(userApiKey._id);
    }

    return userApiKeys.length;
  },
});

// Get user API keys with provider information
export const listByUserWithProviders = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const userApiKeys = await ctx.db
      .query("userApiKeys")
      .withIndex("byUserAndProvider", (q) => q.eq("userId", args.userId))
      .collect();

    return await Promise.all(
      userApiKeys.map(async (userApiKey) => {
        const provider = await ctx.db.get(userApiKey.providerId);
        return {
          ...userApiKey,
          provider,
        };
      })
    );
  },
});

// Check if user has API key for a specific provider
export const hasKeyForProvider = query({
  args: {
    userId: v.id("users"),
    providerId: v.id("modelProviders"),
  },
  handler: async (ctx, args) => {
    const userApiKey = await ctx.db
      .query("userApiKeys")
      .withIndex("byUserAndProvider", (q) =>
        q.eq("userId", args.userId).eq("providerId", args.providerId)
      )
      .first();

    return !!userApiKey;
  },
});
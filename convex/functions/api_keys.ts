import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// Create or update global API key for a provider
export const create = mutation({
  args: {
    providerId: v.id("modelProviders"),
    key: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if API key already exists for this provider
    const existing = await ctx.db
      .query("apiKeys")
      .withIndex("byProvider", (q) => q.eq("providerId", args.providerId))
      .first();
    
    if (existing) {
      // Update existing key
      return await ctx.db.patch(existing._id, {
        key: args.key,
      });
    } else {
      // Create new key
      return await ctx.db.insert("apiKeys", {
        providerId: args.providerId,
        key: args.key,
      });
    }
  },
});

// Get all API keys
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("apiKeys")
      .collect();
  },
});

// Get API key by provider
export const getByProvider = query({
  args: { providerId: v.id("modelProviders") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("apiKeys")
      .withIndex("byProvider", (q) => q.eq("providerId", args.providerId))
      .first();
  },
});

// Get a specific API key
export const get = query({
  args: { id: v.id("apiKeys") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Update API key
export const update = mutation({
  args: {
    id: v.id("apiKeys"),
    key: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      key: args.key,
    });
  },
});

// Delete API key
export const remove = mutation({
  args: { id: v.id("apiKeys") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

// Delete API key by provider
export const removeByProvider = mutation({
  args: { providerId: v.id("modelProviders") },
  handler: async (ctx, args) => {
    const apiKey = await ctx.db
      .query("apiKeys")
      .withIndex("byProvider", (q) => q.eq("providerId", args.providerId))
      .first();
    
    if (apiKey) {
      await ctx.db.delete(apiKey._id);
    }
    
    return apiKey;
  },
});

// Get API keys with provider information
export const listWithProviders = query({
  args: {},
  handler: async (ctx) => {
    const apiKeys = await ctx.db
      .query("apiKeys")
      .collect();

    return await Promise.all(
      apiKeys.map(async (apiKey) => {
        const provider = await ctx.db.get(apiKey.providerId);
        return {
          ...apiKey,
          provider,
        };
      })
    );
  },
});
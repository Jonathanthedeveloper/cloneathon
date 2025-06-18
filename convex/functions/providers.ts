import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// Create a new model provider
export const create = mutation({
  args: {
    name: v.string(),
    logoUrl: v.string(),
    slug: v.string(),
    type: v.union(v.literal("direct"), v.literal("aggregator")),
    byok: v.optional(v.boolean()),
    description: v.optional(v.string()),
    enabled: v.optional(v.boolean()),
    envKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("modelProviders", {
      name: args.name,
      logoUrl: args.logoUrl,
      slug: args.slug,
      type: args.type,
      byok: args.byok || false,
      description: args.description || "",
      enabled: args.enabled || true,
      envKey: args.envKey || "",

    });
  },
});

// Get all model providers
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("modelProviders")
      .order("asc")
      .collect();
  },
});

export const listWithModels = query({
  args: {},
  handler: async (ctx) => {
    const modelProviders = await ctx.db
      .query("modelProviders")
      .order("asc")
      .collect();

    // For each model provider, fetch the associated models
    const providersWithModels = await Promise.all(
      modelProviders.map(async (provider) => {
        const models = await ctx.db
          .query("models")
          .withIndex("byProvider", (q) => q.eq("providerId", provider._id))
          .collect();
        return { ...provider, models };
      })
    );

    return providersWithModels;
  },
});



// Get a specific model provider
export const get = query({
  args: { id: v.id("modelProviders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get model provider by name
export const getByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("modelProviders")
      .withIndex("byName", (q) => q.eq("name", args.name))
      .first();
  },
});

// Update model provider
export const update = mutation({
  args: {
    id: v.id("modelProviders"),
    name: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, updates);
  },
});

// Delete model provider
export const remove = mutation({
  args: { id: v.id("modelProviders") },
  handler: async (ctx, args) => {
    // First delete all models for this provider
    const models = await ctx.db
      .query("models")
      .withIndex("byProvider", (q) => q.eq("providerId", args.id))
      .collect();
    
    for (const model of models) {
      await ctx.db.delete(model._id);
    }
    
    // Delete all API keys for this provider
    const apiKeys = await ctx.db
      .query("apiKeys")
      .withIndex("byProvider", (q) => q.eq("providerId", args.id))
      .collect();
    
    for (const apiKey of apiKeys) {
      await ctx.db.delete(apiKey._id);
    }
    
    // Delete all user API keys for this provider
    const userApiKeys = await ctx.db
      .query("userApiKeys")
      .filter((q) => q.eq(q.field("providerId"), args.id))
      .collect();
    
    for (const userApiKey of userApiKeys) {
      await ctx.db.delete(userApiKey._id);
    }
    
    // Finally delete the provider
    return await ctx.db.delete(args.id);
  },
});
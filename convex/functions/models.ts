import { mutation, query } from "../_generated/server";
import { v } from "convex/values";

// Create a new model
export const create = mutation({
  args: {
    providerId: v.id("modelProviders"),
    name: v.string(),
    features: v.array(v.string()),
    slug: v.string(),
    description: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("models", {
      providerId: args.providerId,
      name: args.name,
      features: args.features,
      description: args.description,
      slug: args.slug,
      createdAt: now,
      updatedAt: now,
    });
  },
});


// Get all models
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("models")
      .order("asc")
      .collect();
  },
});

export const listDefault = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("models")
      .filter((q) => q.eq(q.field("default"), true))
      .order("asc")
      .collect();
  },
});

// Get models by provider
export const listByProvider = query({
  args: { providerId: v.id("modelProviders") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("models")
      .withIndex("byProvider", (q) => q.eq("providerId", args.providerId))
      .order("asc")
      .collect();
  },
});

// Get a specific model
export const get = query({
  args: { id: v.id("models") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get model with provider information
export const getWithProvider = query({
  args: { id: v.id("models") },
  handler: async (ctx, args) => {
    const model = await ctx.db.get(args.id);
    if (!model) return null;

    const provider = await ctx.db.get(model.providerId);
    return {
      ...model,
      provider,
    };
  },
});

// Get all models with provider information
export const listWithProviders = query({
  args: {},
  handler: async (ctx) => {
    const models = await ctx.db
      .query("models")
      .order("asc")
      .collect();

    return await Promise.all(
      models.map(async (model) => {
        const provider = await ctx.db.get(model.providerId);
        return {
          ...model,
          provider,
        };
      })
    );
  },
});

// Update model
export const update = mutation({
  args: {
    id: v.id("models"),
    name: v.optional(v.string()),
    features: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete model
export const remove = mutation({
  args: { id: v.id("models") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

// Get models by feature
export const listByFeature = query({
  args: { feature: v.string() },
  handler: async (ctx, args) => {
    const models = await ctx.db
      .query("models")
      .collect();

    return models.filter(model =>
      model.features.includes(args.feature)
    );
  },
});
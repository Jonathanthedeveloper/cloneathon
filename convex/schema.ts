import { authTables } from "@convex-dev/auth/server";
import { StreamIdValidator } from "@convex-dev/persistent-text-streaming";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    ...authTables,
    conversations: defineTable({
        conversationId: v.optional(v.id("conversations")),
        userId: v.optional(v.id("users")),
        title: v.optional(v.string()),
        isPinned: v.optional(v.boolean()),
        lastMessageId: v.optional(v.id("messages")),
        createdAt: v.number(),
        updatedAt: v.number(),
    }).index("byUserUpdatedAt", ["userId", "updatedAt"])
        .searchIndex("search_title", {
            searchField: "title",
            filterFields: ["userId"]
        }),


    messages: defineTable({
        responseTo: v.optional(v.id("messages")),
        modelId: v.optional(v.id("models")),
        conversationId: v.id("conversations"),
        userId: v.optional(v.id("users")),
        content: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),
        role: v.string(),
        streamId: v.optional(StreamIdValidator),
        attachments: v.optional(v.array(v.object({
            storageId: v.id("_storage"),
            type: v.string(),
            mimeType: v.optional(v.string()),
            url: v.string(),
            name: v.optional(v.string()),
        }))),
        tools: v.optional(v.array(v.string()))
    })
        .index("byUser", ["userId"])
        .index("byConversation", ["conversationId"])
        .searchIndex("search_content", {
            searchField: "content",
            filterFields: ["userId", "conversationId"]
        }),


    modelProviders: defineTable({
        name: v.string(),
        slug: v.string(),
        logoUrl: v.optional(v.string()),
        type: v.union(v.literal("direct"), v.literal("aggregator")),
        byok: v.optional(v.boolean()),
        enabled: v.optional(v.boolean()),
        description: v.optional(v.string()),
        envKey: v.optional(v.string()), // To support env variables for API keys
    }).index("byName", ["name"]).index("bySlug", ["slug"]),

    models: defineTable({
        providerId: v.id("modelProviders"),
        name: v.string(),
        directProviderName: v.optional(v.string()), // Label for aggregator models
        nativeId: v.optional(v.string()), // To support direct models
        aggregatorId: v.optional(v.string()), // To support aggregator models
        architecture: v.optional(v.object({
            modality: v.optional(v.string()),
            input_modalities: v.array(v.string()),
            output_modalities: v.array(v.string()),
            tokenizer: v.optional(v.string())
        })),
        features: v.optional(v.array(v.string())),
        requiresByok: v.optional(v.boolean()), // To support aggregator models that require BYOK
        enabled: v.optional(v.boolean()),
        default: v.optional(v.boolean()),
        description: v.optional(v.string()),

    }).index("byProvider", ["providerId", "name"]),


    apiKeys: defineTable({
        providerId: v.id("modelProviders"),
        key: v.string(),
    }).index("byProvider", ["providerId"]),


    userApiKeys: defineTable({
        userId: v.id("users"),
        providerId: v.id("modelProviders"),
        key: v.string(),
    }).index("byUserAndProvider", ["userId", "providerId"]),

    preferences: defineTable({
        userId: v.id("users"),
        nickName: v.optional(v.string()),
        occupation: v.optional(v.string()),
        aiTraits: v.optional(v.string()),
        bio: v.optional(v.string()),
    }).index("byUser", ["userId"]),


    featureVotes: defineTable({
        userId: v.id("users"),
        feature: v.string(),
        vote: v.number(),
        notify: v.optional(v.boolean())
    }).index("byUserAndFeature", ["userId", "feature"])
});
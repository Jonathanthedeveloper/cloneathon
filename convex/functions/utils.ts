import { query } from "../_generated/server";
import { v } from "convex/values";

// Get complete conversation data with messages and model info
export const getConversationWithMessages = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) return null;

    const messages = await ctx.db
      .query("messages")
      .withIndex("byConversation", (q) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .collect();

    const messagesWithModels = await Promise.all(
      messages.map(async (message) => {
        const model = message.modelId ? await ctx.db.get(message.modelId) : null;
        const provider = model ? await ctx.db.get(model.providerId) : null;
        
        return {
          ...message,
          model: model ? {
            ...model,
            provider,
          } : null,
        };
      })
    );

    return {
      ...conversation,
      messages: messagesWithModels,
    };
  },
});

export const getUserAvailableModels = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Get all providers
    const providers = await ctx.db.query("modelProviders").collect();
    
    // Get all user API keys in a single query
    const userApiKeys = await ctx.db
      .query("userApiKeys")
      .withIndex("byUserAndProvider", (q) => q.eq("userId", args.userId))
      .collect();
    
    // Get all global API keys in a single query
    const globalApiKeys = await ctx.db
      .query("apiKeys")
      .collect();
    
    // Create lookup maps for fast access
    const userKeyMap = new Map(
      userApiKeys.map(key => [key.providerId, key])
    );
    
    const globalKeyMap = new Map(
      globalApiKeys.map(key => [key.providerId, key])
    );
    
    const availableModels = [];
    
    for (const provider of providers) {
      const userApiKey = userKeyMap.get(provider._id);
      const globalApiKey = globalKeyMap.get(provider._id);
      
      if (userApiKey || globalApiKey) {
        const models = await ctx.db
          .query("models")
          .withIndex("byProvider", (q) => q.eq("providerId", provider._id))
          .collect();
          
        const modelsWithProvider = models.map(model => ({
          ...model,
          provider,
          hasUserKey: !!userApiKey,
          hasGlobalKey: !!globalApiKey,
        }));
        
        availableModels.push(...modelsWithProvider);
      }
    }
    
    return availableModels;
  },
});

// Get conversation summary for sidebar
export const getConversationSummaries = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const conversations = await ctx.db
      .query("conversations")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .collect();

    return await Promise.all(
      conversations.map(async (conversation) => {
        // Get the latest message for preview
        const latestMessage = await ctx.db
          .query("messages")
          .withIndex("byConversation", (q) => q.eq("conversationId", conversation._id))
          .order("desc")
          .first();

        // Get message count
        const messageCount = await ctx.db
          .query("messages")
          .withIndex("byConversation", (q) => q.eq("conversationId", conversation._id))
          .collect()
          .then(messages => messages.length);

        return {
          ...conversation,
          latestMessage,
          messageCount,
        };
      })
    );
  },
});

// Search conversations by title or content
export const searchConversations = query({
  args: {
    userId: v.id("users"),
    searchTerm: v.string(),
  },
  handler: async (ctx, args) => {
    const conversations = await ctx.db
      .query("conversations")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();

    const searchResults = [];

    for (const conversation of conversations) {
      // Check if title matches
      const titleMatch = conversation.title?.toLowerCase().includes(args.searchTerm.toLowerCase());

      // Check if any message content matches
      const messages = await ctx.db
        .query("messages")
        .withIndex("byConversation", (q) => q.eq("conversationId", conversation._id))
        .collect();

      const contentMatch = messages.some(message =>
        message.content.toLowerCase().includes(args.searchTerm.toLowerCase())
      );

      if (titleMatch || contentMatch) {
        searchResults.push({
          ...conversation,
          matchType: titleMatch ? "title" : "content",
          messageCount: messages.length,
        });
      }
    }

    return searchResults;
  },
});

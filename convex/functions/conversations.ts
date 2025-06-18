import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";



export const list = query({
  args: {
    search: v.optional(v.string()),
    paginationOpts: paginationOptsValidator
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        page: [],
        isDone: true,
        continueCursor: "",
        splitCursor: null,
        pageStatus: null
      }
    }

    const { search } = args;
    if (search && search.trim()) {
      // Search by conversation title
      const titleQuery = ctx.db.query("conversations")
        .withSearchIndex("search_title", (q) =>
          q.search("title", search).eq("userId", userId)).collect();

      const messageQuery = ctx.db.query("messages")
        .withSearchIndex("search_content", (q) =>
          q.search("content", search).eq("userId", userId))
        .collect();


      const [conversations, messages] = await Promise.all([titleQuery, messageQuery])


      // Get unique conversation IDs from messages
      const conversationIds = new Set(messages.map(msg => msg.conversationId));

      // Fetch conversations from IDs and filter out nulls
      const conversationsFromMessages = (await Promise.all(
        Array.from(conversationIds).map(id => ctx.db.get(id))
      )).filter(Boolean);

      // Combine and remove duplicates
      const allConversations = [
        ...conversations,
        ...conversationsFromMessages
      ].filter(Boolean);

      const nonNullConversations = allConversations.filter(
        (conv): conv is NonNullable<typeof conv> => conv !== null
      );

      const uniqueConversations = Array.from(
        new Map(nonNullConversations.map(conv => [conv._id, conv])).values()
      ).sort((a, b) => b.updatedAt - a.updatedAt);


      return {
        page: uniqueConversations,
        isDone: true,
        continueCursor: "",
        splitCursor: null,
        pageStatus: null
      }

    }


    // Regular list without search
    const conversations = await ctx.db.query("conversations")
      .withIndex("byUserUpdatedAt", (q) => q.eq("userId", userId))
      .order("desc")
      .paginate(args.paginationOpts);


    return conversations
  }
});

// Get a specific conversation
export const get = query({
  args: { id: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Update conversation
export const update = mutation({
  args: {
    id: v.id("conversations"),
    title: v.optional(v.string()),
    isPinned: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

// Delete conversation
export const remove = mutation({
  args: { id: v.id("conversations") },
  handler: async (ctx, args) => {
    // First delete all messages in this conversation
    const messages = await ctx.db
      .query("messages")
      .withIndex("byConversation", (q) => q.eq("conversationId", args.id))
      .collect();

    

    await Promise.all([
      ...messages.map((msg) => ctx.db.delete(msg._id)),
    ]);

    
    // Then delete the conversation itself
    await ctx.db.delete(args.id);
  },
});

// Pin/unpin conversation
export const togglePin = mutation({
  args: { id: v.id("conversations") },
  handler: async (ctx, args) => {
    const conversation = await ctx.db.get(args.id);
    if (!conversation) throw new Error("Conversation not found");

    return await ctx.db.patch(args.id, {
      isPinned: !conversation.isPinned,
      updatedAt: Date.now(),
    });
  },
});

// Get pinned conversations for a user
export const getPinned = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("conversations")
      .filter((q) =>
        q.and(
          q.eq(q.field("userId"), args.userId),
          q.eq(q.field("isPinned"), true)
        )
      )
      .order("desc")
      .collect();
  },
});

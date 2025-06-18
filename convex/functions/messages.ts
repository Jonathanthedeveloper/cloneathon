import { internalMutation, internalQuery, mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { CoreAssistantMessage, CoreSystemMessage, CoreUserMessage } from "ai"
import { StreamId, StreamIdValidator } from "@convex-dev/persistent-text-streaming";
import { paginationOptsValidator } from "convex/server";
import { persistentTextStreaming } from "./chat";





export const getMessageHistory = internalQuery({
  args: {
    streamId: StreamIdValidator,
  },
  handler: async (ctx, args) => {

    const currentMessage = await ctx.db.query("messages").filter(q => q.eq(q.field("streamId"), args.streamId)).first();

    if (!currentMessage) {
      throw new Error("No message found with the provided streamId");
    }

    // Get all messages in the conversation
    const allMessages = await ctx.db
      .query("messages")
      .withIndex("byConversation", (q) => q.eq("conversationId", currentMessage?.conversationId))
      .order("asc")
      .collect();



    const promptMessage = await ctx.db.query("messages").filter(q => q.eq(q.field("_id"), currentMessage.responseTo)).first()

    const messages = await Promise.all(
      allMessages
        .map(async (msg) => {
          if (msg.role === "system") {
            return {
              role: "system",
              content: msg.content,
            } as CoreSystemMessage;
          }
          else if (msg.role === "user") {

            const attachments = msg.attachments?.map((a) => {

              if (a.type === "image") {
                return {
                  type: a.type,
                  image: a.url,
                }
              }
              if (a.type === "file") {
                return {
                  type: a.type,
                  data: a.url,
                }
              }
            }) || [];

            return {
              role: "user",
              content: [{
                type: "text",
                text: msg.content,
              }, ...attachments]
            } as CoreUserMessage;
          }
          else if (msg.role === "assistant") {
            const { text } = await persistentTextStreaming.getStreamBody(
              ctx,
              msg.streamId as StreamId
            )
            return {
              role: "assistant",
              content: [{
                type: "text",
                text
              }]
            } as CoreAssistantMessage;
          }

          // Default case to handle any other role
          return {
            role: msg.role,
            content: msg.content,
          } as CoreSystemMessage;
        }).slice(0, -1)
    );

    const filteredMessages = messages.filter((msg) => {
      // Filter out messages that are empty or only contain whitespace
      if (typeof msg.content === "string") {
        return msg.content.trim() !== "";
      } else if (Array.isArray(msg.content)) {
        return msg.content.some((c) => (c.type === "text" && c.text.trim() !== "") || (c.type === "image" && c.image) || (c.type === "file" && c.data));
      }
      return true;
    });

    return { messages: filteredMessages, tools: promptMessage?.tools || [] }
  }
})

export const getMessageBody = query({
  args: {
    streamId: StreamIdValidator,
  },
  handler: async (ctx, args) => {
    return await persistentTextStreaming.getStreamBody(
      ctx,
      args.streamId as StreamId
    );
  },
});


export const updateMessage = internalMutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    // Update the message content
    return await ctx.db.patch(args.messageId, {
      content: args.content,
      updatedAt: Date.now(),
    });
  },
})


// Get all messages for a conversation
export const list = query({
  args: { conversationId: v.optional(v.id("conversations")), paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {

    if (!args.conversationId) {
      return {
        page: [],
        isDone: true,
        continueCursor: "",
        splitCursor: null,
        pageStatus: null
      }
    }

    return await ctx.db
      .query("messages")
      .withIndex("byConversation", (q) => q.eq("conversationId", args.conversationId!))
      .order("asc").paginate(args.paginationOpts)
  },
});

// Get a specific message
export const get = query({
  args: { id: v.id("messages") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});


// Delete a message
export const remove = mutation({
  args: { id: v.id("messages") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

// Get messages with model information
export const listWithModels = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("byConversation", (q) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .collect();

    return await Promise.all(
      messages.map(async (message) => {
        const model = message.modelId ? await ctx.db.get(message.modelId) : null;
        return {
          ...message,
          model,
        };
      })
    );
  },
});

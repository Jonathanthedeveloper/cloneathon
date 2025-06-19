import { getAuthUserId } from "@convex-dev/auth/server";
import { httpAction, internalQuery, mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { PersistentTextStreaming, StreamId, StreamIdValidator } from "@convex-dev/persistent-text-streaming";
import { components, internal } from "../_generated/api";
import { getProvider } from "../utils";
import { smoothStream, streamText } from "ai"
import { rateLimiter } from "../limiter";
import { webSearch } from "../tools/web_search";
import { PROMPTS } from "../utils/prompts";


export const persistentTextStreaming = new PersistentTextStreaming(
    components.persistentTextStreaming
);


// Create a new message
export const create = mutation({
    args: {
        conversationId: v.optional(v.id("conversations")),
        content: v.string(),
        role: v.string(),
        modelId: v.id("models"),
        attachments: v.optional(v.array(v.id("_storage"))),
        tools: v.optional(v.array(v.string())),
        anonymous: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {

        const userId = await getAuthUserId(ctx);

        let status;

        if (!userId) {
            status = await rateLimiter.limit(ctx, "llmChatGuest");
        }
        else {
            status = await rateLimiter.limit(ctx, "llmChatUser", { key: userId });
        }

        if (!status.ok) {
            const retryHours = (status.retryAfter / (1000 * 60 * 60)).toFixed(2);
            throw new Error(`Rate limit exceeded: Please retry after ${retryHours} hours`);
        }

        const now = Date.now();
        let conversationId = args.conversationId;

        // If no conversation ID is provided, create a new conversation
        if (!conversationId) {
            const title = args.content.substring(0, 50).replace(/\n/g, " ").trim();

            // Create a new conversation
            conversationId = await ctx.db.insert("conversations", {
                userId: args.anonymous ? undefined : userId ?? undefined,
                title: title.length > 100 ? title.substring(0, 97) + "..." : title,
                createdAt: now,
                updatedAt: now,
            });
        }

        const attachmentsPromises = args.attachments?.map(async (attachmentId) => {
            const url = await ctx.storage.getUrl(attachmentId)
            const metadata = await ctx.db.system.get(attachmentId);

            if (!url) {
                throw new Error(`Attachment with ID ${attachmentId} not found`);
            }

            if (!metadata) {
                throw new Error(`Metadata for attachment with ID ${attachmentId} not found`);
            }

            return {
                storageId: attachmentId,
                type: metadata?.contentType?.startsWith("image/") ? "image" :
                    "file",
                mimeType: metadata?.contentType,
                url,
            }
        })

        const attachments = await Promise.all(attachmentsPromises || []);

        // Create the message with the found or created conversation ID
        const userMessageId = await ctx.db.insert("messages", {
            conversationId,
            userId: args.anonymous ? undefined : userId ?? undefined,
            content: args.content,
            role: args.role,
            modelId: args.modelId,
            createdAt: now,
            updatedAt: now,
            attachments,
            tools: args.tools || []
        });

        // Create a persistent text streaming session for the message
        const streamId = await persistentTextStreaming.createStream(ctx)

        // Create a new message for assistant response
        const messageId = await ctx.db.insert("messages", {
            responseTo: userMessageId,
            conversationId,
            role: "assistant",
            streamId,
            modelId: args.modelId,
            createdAt: now,
            updatedAt: now,
        });

        await ctx.db.patch(conversationId, {
            lastMessageId: messageId,
            updatedAt: now,
        });

        return { conversationId, messageId };
    },
});

export const streamChatV2 = httpAction(async (ctx, request) => {

    const body = (await request.json()) as {
        streamId: StreamId,
    };

    const config = await ctx.runQuery(internal.functions.chat.getChatConfig, {
        streamId: body.streamId
    });


    const provider = getProvider({
        provider: config.provider.slug,
        apiKey: config.apiKey,
    });

    if (!provider) {
        throw new Error("Invalid provider or API key");
    }

    const modelId = config.model.aggregatorId || config.model.nativeId;

    if (!modelId) {
        throw new Error("Model ID is required for streaming");
    }

    const response = await persistentTextStreaming.stream(ctx, request, body.streamId as StreamId,
        async (ctx, request, streamId, append) => {
            const { messages, tools } = await ctx.runQuery(internal.functions.messages.getMessageHistory, {
                streamId
            })


            console.log("Streaming chat for model:", modelId, "with messages:", messages, tools);

            // --- Collect web search results ---
            const collectedSources: { title?: string; url?: string; content?: string }[] = [];

            // --- Dynamic system prompt based on tools ---
            let systemPrompt = "You are a helpful assistant.";
            if (tools && tools.length > 0) {
                const toolDescriptions: Record<string, string> = {
                    search: "You can use web search to answer questions with up-to-date information.",

                };
                const enabled = tools.map((t: string) => toolDescriptions[t] || t).join(" ");
                systemPrompt = `You are a helpful assistant. ${enabled}`;
            }

            try {
                const { textStream, } = streamText({
                    model: provider(modelId),
                    messages,
                    experimental_transform: smoothStream(),
                    maxSteps: 3,
                    providerOptions: {
                        openrouter: {
                            require_parameters: true,
                            allow_fallbacks: true,
                            include_reasoning: true,
                        }
                    },
                    tools: {
                        webSearch
                    },
                    toolChoice: tools.length > 0 ? "required" : "auto",
                    toolCallStreaming: true,
                    onStepFinish: (step) => {
                        console.log(JSON.stringify(step.sources, null, 2));
                        console.log(JSON.stringify(step.reasoning, null, 2));
                    },
                    onError: (error) => {
                        throw error
                    },
                    onFinish: () => {
                    },
                    system: systemPrompt,
                })

                for await (const text of textStream) {
                    await append(text);
                }

                // --- Append sources as markdown if any were found ---
                if (collectedSources.length > 0) {
                    let sourcesMarkdown = "\n\n---\n**Sources:**\n";
                    // Map sources to ensure title is always a string
                    const safeSources = collectedSources.map(src => ({
                        ...src,
                        title: typeof src.title === 'string' ? src.title : ''
                    }));
                    for (const src of safeSources) {
                        if (src.title && src.url) {
                            sourcesMarkdown += `- [${src.title}](${src.url})`;
                            if (src.content) {
                                sourcesMarkdown += `: ${src.content.slice(0, 200)}...`;
                            }
                            sourcesMarkdown += "\n";
                        }
                    }
                    await append(sourcesMarkdown);
                }

            } catch (error) {
                console.error("Error streaming chat:", error);
            }

        }
    )

    // Set CORS headers appropriately.
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Vary", "Origin");
    return response;
})

export const streamChat = httpAction(async (ctx, request) => {

    const body = (await request.json()) as {
        streamId: StreamId,
    };

    const config = await ctx.runQuery(internal.functions.chat.getChatConfig, {
        streamId: body.streamId
    });


    const provider = getProvider({
        provider: config.provider.slug,
        apiKey: config.apiKey,
    });

    if (!provider) {
        throw new Error("Invalid provider or API key");
    }

    const modelId = config.model.aggregatorId || config.model.nativeId;

    if (!modelId) {
        throw new Error("Model ID is required for streaming");
    }

    const response = await persistentTextStreaming.stream(ctx, request, body.streamId as StreamId,
        async (ctx, request, streamId, append) => {
            const { messages, tools } = await ctx.runQuery(internal.functions.messages.getMessageHistory, {
                streamId
            })



            try {
                const { textStream, } = streamText({
                    model: provider(modelId),
                    messages,
                    experimental_transform: smoothStream(),
                    maxSteps: 3,
                    providerOptions: {
                        openrouter: {
                            require_parameters: true,
                            allow_fallbacks: true,
                            include_reasoning: true,
                        }
                    },
                    tools: tools.length <= 0 ? undefined : {
                        webSearch
                    },
                    toolChoice: tools.length > 0 ? "required" : "auto",
                    toolCallStreaming: true,
                    onStepFinish: () => {
                        // TODO
                    },
                    onError: (error) => {
                        throw error
                    },
                    onFinish: () => {
                        // TODO
                    },
                    system: PROMPTS.default,
                })

                for await (const text of textStream) {
                    await append(text);
                }

            } catch (error) {
                console.error("Error streaming chat:", error);
            }

        }
    )

    // Set CORS headers appropriately.
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Vary", "Origin");
    return response;
})


export const getChatConfig = internalQuery({
    args: {
        streamId: v.optional(StreamIdValidator)
    },
    handler: async (ctx, args) => {
        const userId = await getAuthUserId(ctx);

        const message = await ctx.db.query("messages").filter(q => q.eq(q.field("streamId"), args.streamId)).first();

        if (!message) {
            throw new Error("Message not found for the provided streamId");
        }

        const model = await ctx.db.get(message.modelId!);

        if (!model) {
            throw new Error("Model not found");
        }

        const provider = await ctx.db.get(model.providerId);

        if (!provider) {
            throw new Error("Provider not found");
        }

        // Get user API key for this provider (if user is authenticated)
        const userApiKey = userId
            ? await ctx.db
                .query("userApiKeys")
                .withIndex("byUserAndProvider", (q) =>
                    q.eq("userId", userId).eq("providerId", provider._id)
                )
                .first()
            : null;

        // Get system API key for this provider
        const systemApiKey = await ctx.db
            .query("apiKeys")
            .withIndex("byProvider", (q) => q.eq("providerId", provider._id))
            .first();

        const apiKeyToUse = userApiKey?.key || systemApiKey?.key;



        return {
            provider,
            model,
            apiKey: apiKeyToUse,
        }

    }
})

export const getStreamBody = query({
    args: {
        streamId: StreamIdValidator
    },
    handler: async (ctx, args) => {
        return await persistentTextStreaming.getStreamBody(
            ctx,
            args.streamId as StreamId
        );
    }
})

export const branch = mutation({
    args: {
        messageId: v.id("messages")
    },
    handler: async (ctx, args) => {

        const userId = await getAuthUserId(ctx);

        if (!userId) {
            throw new Error("User not authenticated");
        }


        //    Get message
        const message = await ctx.db.get(args.messageId)

        if (!message) {
            throw new Error("Message not found");
        }

        const conversation = await ctx.db.get(message.conversationId);

        if (!conversation) {
            throw new Error("Conversation not found");
        }

        // Get All Previous messages in the conversation
        const messages = await ctx.db
            .query("messages")
            .filter(q => q.eq(q.field("conversationId"), message.conversationId))
            .filter(q => q.lte(q.field("_creationTime"), message._creationTime))
            .order("asc")
            .collect();

        // Create new Conversation
        const conversationId = await ctx.db.insert("conversations", {
            conversationId: conversation._id,
            title: "New Branch",
            userId,
            isPinned: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        })

        const messageQuery = messages.map(async (msg) => {
            // Create new messages in the new conversation
            // Extract all properties except _id and _creationTime
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { _id: _omitId, _creationTime: _omitCreationTime, ...messageData } = msg;
            await ctx.db.insert("messages", {
                ...messageData,
                conversationId,
                updatedAt: Date.now(),
            });
        });

        await Promise.all(messageQuery);

        return { conversationId };
    }
})

export const regenerate = mutation({
    args: {
        messageId: v.id("messages"),
        modelId: v.optional(v.id("models")),
    },
    handler: async (ctx, args) => {

        // Get Message Prompt
        const message = await ctx.db.get(args.messageId);

        if (!message) {
            throw new Error("Message not found");
        }

        // Delete all messages after it
        const messagesToDelete = await ctx.db
            .query("messages")
            .filter(q => q.eq(q.field("conversationId"), message.conversationId))
            .filter(q => q.gt(q.field("_creationTime"), message._creationTime))
            .collect();

        await Promise.all(messagesToDelete.map(msg => ctx.db.delete(msg._id)));



        // Create Stream
        const streamId = await persistentTextStreaming.createStream(ctx)

        // Create Assistance response with stream Id taking note of changes in model selection
        const messageId = await ctx.db.insert("messages", {
            responseTo: args.messageId,
            conversationId: message.conversationId,
            role: "assistant",
            streamId,
            modelId: args.modelId || message.modelId,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });



        await ctx.db.patch(message.conversationId, {
            lastMessageId: messageId,
            updatedAt: Date.now(),
        });

        return { messageId };


    }
})
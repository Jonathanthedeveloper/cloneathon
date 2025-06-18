import { v } from "convex/values";
import { internalAction, internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { ModelFeature } from "@/types";

const NAME_EXTRACT_REGEX = /^(?:([^:]+):\s*)?(.+?)(?:\s+(?:Preview\s+)?\d{2}-\d{2})?$/;


export type OpenRouterModelsResponse = {
    data: Model[]
}

type Model = {
    id: string,
    name: string,
    created: number,
    description: string,
    architecture: {
        modality: string,
        input_modalities: string[],
        output_modalities: string[],
        tokenizer: string
    },
    top_provider: {
        is_moderated: boolean
    },
    pricing: {
        prompt: string,
        completion: string,
        image: string,
        request: string,
        input_cache_read: string,
        input_cache_write: string,
        web_search: string,
        internal_reasoning: string
    },
    context_length: number,
    hugging_face_id: string,
    per_request_limits: {
        key: string
    },
    supported_parameters: string[]
}

export const syncModels = internalAction({
    args: {},
    handler: async (ctx) => {
        try {
            console.log("Starting OpenRouter models sync...");

            const response = await fetch("https://openrouter.ai/api/v1/models");

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: OpenRouterModelsResponse = await response.json();

            if (!data.data || !Array.isArray(data.data)) {
                throw new Error("Invalid response format from OpenRouter API");
            }

            console.log(`Fetched ${data.data.length} models from OpenRouter`);

            // Update models in database
            await ctx.runMutation(internal.functions.openrouter.updateModels, {
                models: data.data.map(model => {

                    const match = model.name.match(NAME_EXTRACT_REGEX);
                    const displayModelName = match ? match[2].trim() : model.name;
                    const providerName = model.id.split("/")[0];

                    const features: ModelFeature[] = [];

                    model.architecture.input_modalities.forEach(modality => {
                        switch (modality) {
                            case "file":
                                features.push("file");
                                break;
                            case "image":
                                features.push("vision");
                                break;
                        }
                    })

                    model.architecture.output_modalities.forEach(modality => {
                        switch (modality) {
                            case "image":
                                features.push("image");
                                break;
                        }
                    })

                    const webSearchPrice = parseFloat(model.pricing.web_search ?? 0)
                    const internalReasoning = parseFloat(model.pricing.internal_reasoning ?? 0)

                    if (webSearchPrice > 0)
                        features.push("search");
                    if (internalReasoning > 0)
                        features.push("reasoning");




                    return {
                        name: displayModelName,
                        directProviderName: providerName,
                        aggregatorId: model.id,
                        architecture: {
                            modality: model.architecture.modality,
                            input_modalities: model.architecture.input_modalities,
                            output_modalities: model.architecture.output_modalities,
                        },
                        features,
                    }
                }),
            });

            console.log("OpenRouter models sync completed successfully");
        } catch (error) {
            console.error("Error syncing OpenRouter models:", error);
            throw error;
        }
    },
});

export const updateModels = internalMutation({
    args: {
        models: v.array(v.object({
            name: v.string(),
            directProviderName: v.string(),
            aggregatorId: v.optional(v.string()),
            architecture: v.optional(v.object({
                modality: v.optional(v.string()),
                input_modalities: v.array(v.string()),
                output_modalities: v.array(v.string()),
                tokenizer: v.optional(v.string())
            })),
            features: v.optional(v.array(v.string())),
        })),
    },
    handler: async (ctx, { models }) => {

        const provider = await ctx.db.query("modelProviders").filter(q => q.eq(q.field("slug"), "openrouter")).first()

        if (!provider)
            throw new Error("Open router isn't configured yet")

        const existingModels = await ctx.db.query("models").filter(q => q.eq(q.field("providerId"), provider._id)).collect()


        const existingModelMap = new Map();
        for (const existingModel of existingModels) {
            existingModelMap.set(existingModel.aggregatorId, existingModel);
        }

        for (const model of models) {
            const existingModel = existingModelMap.get(model.aggregatorId);

            console.log(`Processing model: ${model.aggregatorId} - ${model.directProviderName} - ${model.name}`);

            if (existingModel) {
                 await ctx.db.patch(existingModel._id, {
                    name: model.name,
                    directProviderName: model.directProviderName,
                    aggregatorId: model.aggregatorId,
                    architecture: model.architecture,
                    features: model.features || [],
                });
            } else {
                // Create new model
                await ctx.db.insert("models", {
                    providerId: provider._id,
                    name: model.name,
                    directProviderName: model.directProviderName,
                    aggregatorId: model.aggregatorId,
                    architecture: model.architecture,
                    features: model.features || [],
                    enabled: false,
                    requiresByok: false,
                    default: false,
                });
            }
        }

        console.log(`Updated ${models.length} OpenRouter models in database`);
    },
});
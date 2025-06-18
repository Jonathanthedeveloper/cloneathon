import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI, } from "@ai-sdk/openai";
import { createCohere } from '@ai-sdk/cohere';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';




type Provider = {
    provider: string;
    apiKey?: string
}


export function getProvider({ provider, apiKey }: Provider) {
    switch (provider) {
        case "google":
            return createGoogleGenerativeAI({
                apiKey: apiKey || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
            });
        case "openai":
            return createOpenAI({
                apiKey: apiKey || process.env.OPENAI_API_KEY,
            })
        case "cohere":
            return createCohere({
                apiKey: apiKey || process.env.COHERE_API_KEY,
            })
        case "openrouter":
            return createOpenRouter({
                apiKey,
            }).chat;
        default:
            return createOpenRouter({
                apiKey: apiKey || process.env.OPENROUTER_API_KEY,
            }).chat;
    }
}
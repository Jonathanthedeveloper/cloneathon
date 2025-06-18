/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as crons from "../crons.js";
import type * as functions_api_keys from "../functions/api_keys.js";
import type * as functions_chat from "../functions/chat.js";
import type * as functions_conversations from "../functions/conversations.js";
import type * as functions_feature_votes from "../functions/feature_votes.js";
import type * as functions_messages from "../functions/messages.js";
import type * as functions_models from "../functions/models.js";
import type * as functions_openrouter from "../functions/openrouter.js";
import type * as functions_preferences from "../functions/preferences.js";
import type * as functions_providers from "../functions/providers.js";
import type * as functions_storage from "../functions/storage.js";
import type * as functions_user_api_keys from "../functions/user_api_keys.js";
import type * as functions_users from "../functions/users.js";
import type * as functions_utils from "../functions/utils.js";
import type * as http from "../http.js";
import type * as limiter from "../limiter.js";
import type * as tools_web_search from "../tools/web_search.js";
import type * as utils_index from "../utils/index.js";
import type * as utils_prompts from "../utils/prompts.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  crons: typeof crons;
  "functions/api_keys": typeof functions_api_keys;
  "functions/chat": typeof functions_chat;
  "functions/conversations": typeof functions_conversations;
  "functions/feature_votes": typeof functions_feature_votes;
  "functions/messages": typeof functions_messages;
  "functions/models": typeof functions_models;
  "functions/openrouter": typeof functions_openrouter;
  "functions/preferences": typeof functions_preferences;
  "functions/providers": typeof functions_providers;
  "functions/storage": typeof functions_storage;
  "functions/user_api_keys": typeof functions_user_api_keys;
  "functions/users": typeof functions_users;
  "functions/utils": typeof functions_utils;
  http: typeof http;
  limiter: typeof limiter;
  "tools/web_search": typeof tools_web_search;
  "utils/index": typeof utils_index;
  "utils/prompts": typeof utils_prompts;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

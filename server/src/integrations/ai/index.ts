import { IAIProvider } from "./AIProvider.js";
import { HeuristicAIProvider } from "./HeuristicAIProvider.js";
import { GeminiProvider } from "./GeminiProvider.js";
import { config } from "../../config/env.js";

let aiProviderInstance: IAIProvider | null = null;

export function getAIProvider(): IAIProvider {
  if (aiProviderInstance) return aiProviderInstance;

  if (config.ai.provider === "gemini" && config.ai.apiKey) {
    aiProviderInstance = new GeminiProvider(config.ai.apiKey, config.ai.model);
  } else {
    aiProviderInstance = new HeuristicAIProvider();
  }

  return aiProviderInstance;
}

export const aiProvider = getAIProvider();

export * from "./AIProvider.js";

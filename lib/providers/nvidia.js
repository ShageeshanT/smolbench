// NVIDIA NIM via the OpenAI-compatible endpoint. Single base URL, many models.

import { createOpenAICompatProvider } from "./openai-compat.js";

export function createNvidiaProvider({ apiKey, model }) {
  return createOpenAICompatProvider({
    id: "nvidia",
    baseUrl: "https://integrate.api.nvidia.com/v1",
    apiKey,
    model,
  });
}

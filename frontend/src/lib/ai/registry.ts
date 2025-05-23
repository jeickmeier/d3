export type ProviderID = "openai" | "google" | "custom";

export type ModelID =
  | "gpt-4o-mini"
  | "gpt-4.1"
  | "gemini-2.5-flash-preview-05-20"
  | "gemini-2.5-pro-preview-05-06"
  | "hacker_news_agent"
  | "web_agent";

export interface ProviderInfo {
  id: ProviderID;
  name: string;
  models: ModelID[];
}

export const PROVIDERS: ProviderInfo[] = [
  {
    id: "openai",
    name: "OpenAI",
    models: ["gpt-4o-mini", "gpt-4.1"],
  },
  {
    id: "google",
    name: "Google Gemini",
    models: ["gemini-2.5-flash-preview-05-20", "gemini-2.5-pro-preview-05-06"],
  },
  {
    id: "custom",
    name: "Custom Agent",
    models: ["hacker_news_agent", "web_agent"],
  },
];

export const ALL_MODELS: ModelID[] = PROVIDERS.flatMap((p) => p.models);

export function modelsFor(provider: ProviderID): ModelID[] {
  const entry = PROVIDERS.find((p) => p.id === provider);
  return entry ? entry.models : [];
}

export function providerFor(model: ModelID): ProviderID | undefined {
  const entry = PROVIDERS.find((p) => p.models.includes(model));
  return entry?.id;
}

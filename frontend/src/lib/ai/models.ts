import { registry } from "./registry";

export function getLanguageModel(id: string) {
  // @ts-expect-error: dynamic provider:model id
  return registry.languageModel(id);
}

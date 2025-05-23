"use client";

import * as React from "react";

import { CopilotPlugin } from "@udecode/plate-ai/react";
import { useEditorPlugin } from "@udecode/plate/react";
import {
  Check,
  ChevronsUpDown,
  ExternalLinkIcon,
  Eye,
  EyeOff,
  Settings,
  Wand2Icon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  ProviderID,
  ModelID,
  PROVIDERS,
  ALL_MODELS,
  modelsFor,
} from "@/lib/ai/registry";

// Define UI-facing types driven by the AI registry
export type Model = {
  label: string;
  value: ModelID;
};

interface ApiKeys {
  uploadthing: string;
}

export type Provider = {
  label: string;
  value: ProviderID;
};

export const providers: Provider[] = PROVIDERS.map(({ id, name }) => ({
  label: name,
  value: id,
}));

export const models: Model[] = ALL_MODELS.map((m) => ({ label: m, value: m }));

export interface SettingsContextType {
  apiKeys: ApiKeys;
  aiSelection: { provider: Provider; model: Model };
  setApiKey: (service: keyof ApiKeys, key: string) => void;
  setAiSelection: (selection: { provider: Provider; model: Model }) => void;
}

const SettingsContext = React.createContext<SettingsContextType | undefined>(
  undefined,
);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [apiKeys, setApiKeys] = React.useState<ApiKeys>({
    uploadthing: "",
  });
  const [aiSelectionState, setAiSelectionState] = React.useState<{
    provider: Provider;
    model: Model;
  }>(() => {
    const defaultProvider = providers[0];
    const defaultModelID = modelsFor(defaultProvider.value)[0];
    const defaultModel: Model = {
      label: defaultModelID,
      value: defaultModelID,
    };
    return { provider: defaultProvider, model: defaultModel };
  });

  const setApiKey = (service: keyof ApiKeys, key: string) => {
    setApiKeys((prev) => ({ ...prev, [service]: key }));
  };

  const setAiSelection = (selection: { provider: Provider; model: Model }) => {
    const allowedModels = modelsFor(selection.provider.value);
    let modelValue = selection.model.value;
    if (!allowedModels.includes(modelValue)) {
      modelValue = allowedModels[0];
    }
    const modelObj: Model = { label: modelValue, value: modelValue };
    setAiSelectionState({
      provider: selection.provider,
      model: modelObj,
    });
  };

  return (
    <SettingsContext.Provider
      value={{
        apiKeys,
        aiSelection: aiSelectionState,
        setApiKey,
        setAiSelection,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextType {
  const context = React.useContext(SettingsContext);

  return (
    context ?? {
      apiKeys: {
        uploadthing: "",
      },
      aiSelection: {
        provider: providers[0],
        model: (() => {
          const defaultModelID = modelsFor(providers[0].value)[0];
          return { label: defaultModelID, value: defaultModelID };
        })(),
      },
      setApiKey: () => {},
      setAiSelection: () => {},
    }
  );
}

export function SettingsDialog() {
  const { apiKeys, aiSelection, setApiKey, setAiSelection } = useSettings();
  const { provider: aiProvider, model: aiModel } = aiSelection;
  const availableModels: Model[] = modelsFor(aiProvider.value).map((mid) => ({
    label: mid,
    value: mid,
  }));
  const [tempApiKeys, setTempApiKeys] = React.useState(apiKeys);
  const [showKey, setShowKey] = React.useState<Record<string, boolean>>({});
  const [open, setOpen] = React.useState(false);
  const [openProvider, setOpenProvider] = React.useState(false);
  const [openModel, setOpenModel] = React.useState(false);

  const { getOptions, setOption } = useEditorPlugin(CopilotPlugin);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    (Object.entries(tempApiKeys) as [keyof ApiKeys, string][]).forEach(
      ([service, key]) => {
        setApiKey(service, key);
      },
    );
    setOpen(false);

    // Update AI options if needed
    const completeOptions = getOptions().completeOptions ?? {};
    setOption("completeOptions", {
      ...completeOptions,
      body: {
        ...completeOptions.body,
        model: aiModel.value,
      },
    });
  };

  const toggleKeyVisibility = (key: string) => {
    setShowKey((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderApiKeyInput = (service: keyof ApiKeys, label: string) => (
    <div className="group relative">
      <div className="flex items-center justify-between">
        <label
          className="absolute top-1/2 block -translate-y-1/2 cursor-text px-1 text-sm text-muted-foreground/70 transition-all group-focus-within:pointer-events-none group-focus-within:top-0 group-focus-within:cursor-default group-focus-within:text-xs group-focus-within:font-medium group-focus-within:text-foreground has-[+input:not(:placeholder-shown)]:pointer-events-none has-[+input:not(:placeholder-shown)]:top-0 has-[+input:not(:placeholder-shown)]:cursor-default has-[+input:not(:placeholder-shown)]:text-xs has-[+input:not(:placeholder-shown)]:font-medium has-[+input:not(:placeholder-shown)]:text-foreground"
          htmlFor={label}
        >
          <span className="inline-flex bg-background px-2">{label}</span>
        </label>
        <Button
          asChild
          size="icon"
          variant="ghost"
          className="absolute top-0 right-[28px] h-full"
        >
          <a
            className="flex items-center"
            href={"https://uploadthing.com/dashboard"}
            rel="noopener noreferrer"
            target="_blank"
          >
            <ExternalLinkIcon className="size-4" />
            <span className="sr-only">Get {label}</span>
          </a>
        </Button>
      </div>

      <Input
        id={label}
        className="pr-10"
        value={tempApiKeys[service]}
        onChange={(e) =>
          setTempApiKeys((prev) => ({ ...prev, [service]: e.target.value }))
        }
        placeholder=""
        data-1p-ignore
        type={showKey[service] ? "text" : "password"}
      />
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-0 right-0 h-full"
        onClick={() => toggleKeyVisibility(service)}
        type="button"
      >
        {showKey[service] ? (
          <EyeOff className="size-4" />
        ) : (
          <Eye className="size-4" />
        )}
        <span className="sr-only">
          {showKey[service] ? "Hide" : "Show"} {label}
        </span>
      </Button>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="default"
          className={cn(
            "group fixed right-4 bottom-4 z-50 size-10 overflow-hidden",
            "rounded-full shadow-md hover:shadow-lg",
          )}
          data-block-hide
        >
          <Settings className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            {`These API keys are stored in local storage and are not secure.
            Do not use them in production. They are for development and
            demonstration purposes only.`}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-10" onSubmit={handleSubmit}>
          {/* AI Settings Group */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-purple-100 p-2 dark:bg-purple-900">
                <Wand2Icon className="size-4 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-semibold">AI</h4>
            </div>

            <div className="space-y-4">
              {renderApiKeyInput("uploadthing", "UploadThing API key")}

              {/* Provider selector */}
              <div className="group relative">
                <label
                  className="absolute start-1 top-0 z-10 block -translate-y-1/2 bg-background px-2 text-xs font-medium text-foreground"
                  htmlFor="select-provider"
                >
                  Provider
                </label>
                <Popover open={openProvider} onOpenChange={setOpenProvider}>
                  <PopoverTrigger id="select-provider" asChild>
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full justify-between"
                      aria-expanded={openProvider}
                      role="combobox"
                    >
                      <code>{aiProvider.label}</code>
                      <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search provider..." />
                      <CommandEmpty>No provider found.</CommandEmpty>
                      <CommandList>
                        <CommandGroup>
                          {providers.map((p) => (
                            <CommandItem
                              key={p.value}
                              value={p.value}
                              onSelect={() => {
                                setAiSelection({
                                  provider: p,
                                  model: aiModel,
                                });
                                setOpenProvider(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 size-4",
                                  aiProvider.value === p.value
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              <code>{p.label}</code>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="group relative">
                <label
                  className="absolute start-1 top-0 z-10 block -translate-y-1/2 bg-background px-2 text-xs font-medium text-foreground group-has-disabled:opacity-50"
                  htmlFor="select-model"
                >
                  Model
                </label>
                <Popover open={openModel} onOpenChange={setOpenModel}>
                  <PopoverTrigger id="select-model" asChild>
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full justify-between"
                      aria-expanded={openModel}
                      role="combobox"
                    >
                      <code>{aiModel.label}</code>
                      <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search model..." />
                      <CommandEmpty>No model found.</CommandEmpty>
                      <CommandList>
                        <CommandGroup>
                          {availableModels.map((m) => (
                            <CommandItem
                              key={m.value}
                              value={m.value}
                              onSelect={() => {
                                setAiSelection({
                                  provider: aiProvider,
                                  model: m,
                                });
                                setOpenModel(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 size-4",
                                  aiModel.value === m.value
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              <code>{m.label}</code>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Upload Settings Group */}
          {/* <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-red-100 p-2 dark:bg-red-900">
                <Upload className="size-4 text-red-600 dark:text-red-400" />
              </div>
              <h4 className="font-semibold">Upload</h4>
            </div>

            <div className="space-y-4">
              {renderApiKeyInput('uploadthing', 'Uploadthing API key')}
            </div>
          </div> */}

          <Button size="lg" className="w-full" type="submit">
            Save changes
          </Button>
        </form>

        <p className="text-sm text-muted-foreground">
          Not stored anywhere. Used only for current session requests.
        </p>
      </DialogContent>
    </Dialog>
  );
}

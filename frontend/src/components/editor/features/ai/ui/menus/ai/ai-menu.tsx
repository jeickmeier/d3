"use client";

import * as React from "react";

import { type NodeEntry, isHotkey as _isHotkey } from "@udecode/plate";
import {
  AIChatPlugin,
  useEditorChat,
  useLastAssistantMessage,
} from "@udecode/plate-ai/react";
import {
  BlockSelectionPlugin,
  useIsSelecting,
} from "@udecode/plate-selection/react";
import {
  useEditorPlugin,
  useHotkeys,
  usePluginOption,
} from "@udecode/plate/react";
import { Command as CommandPrimitive } from "cmdk";
import { Loader2Icon } from "lucide-react";

import { Command, CommandList } from "@/components/ui/command";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useChat } from "@components/editor/features/ai/core/use-chat";

import { AIChatEditor } from "../../elements/ai-chat-editor";
import { AIMenuItems } from "./ai-menu-items";

// A strongly typed wrapper around `isHotkey` to satisfy the linter.
const isHotkey: (
  hotkey: string,
  event: KeyboardEvent | React.KeyboardEvent,
) => boolean = _isHotkey as unknown as (
  hotkey: string,
  event: KeyboardEvent | React.KeyboardEvent,
) => boolean;

export function AIMenu() {
  const { api, editor } = useEditorPlugin(AIChatPlugin);
  const aiChatApi = api.aiChat as unknown as {
    show: () => void;
    hide: () => void;
    submit: () => Promise<void> | void;
    stop: () => void;
    node: (options?: { anchor?: boolean }) => NodeEntry | undefined;
  };
  const open = usePluginOption(AIChatPlugin, "open");
  const mode = usePluginOption(AIChatPlugin, "mode");
  const streaming = usePluginOption(AIChatPlugin, "streaming");
  const isSelecting = Boolean(useIsSelecting());

  const [value, setValue] = React.useState("");

  const chat = useChat();

  const { input, messages, setInput, status } = chat;
  const [anchorElement, setAnchorElement] = React.useState<HTMLElement | null>(
    null,
  );

  const content = useLastAssistantMessage()?.content;

  React.useEffect(() => {
    if (streaming) {
      const anchor = aiChatApi.node({ anchor: true });
      setTimeout(() => {
        const anchorDom = editor.api.toDOMNode(anchor![0])!;
        setAnchorElement(anchorDom);
      }, 0);
    }
  }, [streaming]);

  const hideChat = () => aiChatApi.hide();
  const submitChat = () => aiChatApi.submit();

  const setOpen = (open: boolean) => {
    if (open) {
      aiChatApi.show();
    } else {
      hideChat();
    }
  };

  const show = (anchorElement: HTMLElement) => {
    setAnchorElement(anchorElement);
    setOpen(true);
  };

  useEditorChat({
    chat,
    onOpenBlockSelection: (blocks: NodeEntry[]) => {
      show(editor.api.toDOMNode(blocks.at(-1)![0])!);
    },
    onOpenChange: (open) => {
      if (!open) {
        setAnchorElement(null);
        setInput("");
      }
    },
    onOpenCursor: () => {
      const [ancestor] = editor.api.block({ highest: true })!;

      if (!editor.api.isAt({ end: true }) && !editor.api.isEmpty(ancestor)) {
        editor
          .getApi(BlockSelectionPlugin)
          .blockSelection.set(ancestor.id as string);
      }

      show(editor.api.toDOMNode(ancestor)!);
    },
    onOpenSelection: () => {
      show(editor.api.toDOMNode(editor.api.blocks().at(-1)![0])!);
    },
  });

  useHotkeys(
    "meta+j",
    () => {
      aiChatApi.show();
    },
    { enableOnContentEditable: true, enableOnFormTags: true },
  );

  useHotkeys("esc", () => {
    aiChatApi.stop();
  });

  const isLoading = status === "streaming" || status === "submitted";

  if (isLoading && mode === "insert") {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverAnchor virtualRef={{ current: anchorElement! }} />

      <PopoverContent
        className="border-none bg-transparent p-0 shadow-none"
        style={{
          width: anchorElement?.offsetWidth,
        }}
        onEscapeKeyDown={(e: KeyboardEvent) => {
          e.preventDefault();

          hideChat();
        }}
        align="center"
        side="bottom"
      >
        <Command
          className="w-full rounded-lg border shadow-md"
          value={value}
          onValueChange={setValue}
        >
          {mode === "chat" && isSelecting && content && (
            <AIChatEditor content={content} />
          )}

          {isLoading ? (
            <div className="flex grow items-center gap-2 p-2 text-sm text-muted-foreground select-none">
              <Loader2Icon className="size-4 animate-spin" />
              {messages.length > 1 ? "Editing..." : "Thinking..."}
            </div>
          ) : (
            <CommandPrimitive.Input
              className={cn(
                "flex h-9 w-full min-w-0 border-input bg-transparent px-3 py-1 text-base transition-[color,box-shadow] outline-none placeholder:text-muted-foreground md:text-sm dark:bg-input/30",
                "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
                "border-b focus-visible:ring-transparent",
              )}
              value={input}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (isHotkey("backspace", e) && input.length === 0) {
                  e.preventDefault();
                  hideChat();
                }
                if (isHotkey("enter", e) && !e.shiftKey && !value) {
                  e.preventDefault();
                  void submitChat();
                }
              }}
              onValueChange={setInput}
              placeholder="Ask AI anything..."
              data-plate-focus
              autoFocus
            />
          )}

          {!isLoading && (
            <CommandList>
              <AIMenuItems setValue={setValue} />
            </CommandList>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}

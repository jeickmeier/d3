"use client";

import * as React from "react";

import {
  type EmojiDropdownMenuOptions,
  useEmojiDropdownMenuState,
} from "@udecode/plate-emoji/react";
import { Smile } from "lucide-react";

import {
  emojiCategoryIcons,
  emojiSearchIcons,
} from "@/components/editor/settings/emoji-icons";
import { EmojiPicker } from "@/components/editor/core/ui/menus/emoji/emoji-picker";
import { EmojiToolbarDropdown } from "@/components/editor/core/ui/menus/emoji/emoji-toolbar-dropdown";
import { ToolbarButton } from "@/components/editor/core/ui/menus/toolbars/toolbar";

type EmojiDropdownMenuProps = {
  options?: EmojiDropdownMenuOptions;
} & React.ComponentPropsWithoutRef<typeof ToolbarButton>;

export function EmojiDropdownMenu({
  options,
  ...props
}: EmojiDropdownMenuProps) {
  const { emojiPickerState, isOpen, setIsOpen } =
    useEmojiDropdownMenuState(options);

  return (
    <EmojiToolbarDropdown
      control={
        <ToolbarButton pressed={isOpen} tooltip="Emoji" isDropdown {...props}>
          <Smile />
        </ToolbarButton>
      }
      isOpen={isOpen}
      setIsOpen={setIsOpen}
    >
      <EmojiPicker
        {...emojiPickerState}
        icons={{
          categories: emojiCategoryIcons,
          search: emojiSearchIcons,
        }}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        settings={options?.settings}
      />
    </EmojiToolbarDropdown>
  );
}

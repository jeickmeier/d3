"use client";

import * as React from "react";

import type { DropdownMenuProps } from "@radix-ui/react-dropdown-menu";

import { DropdownMenuItemIndicator } from "@radix-ui/react-dropdown-menu";
import {
  useLineHeightDropdownMenu,
  useLineHeightDropdownMenuState,
} from "@udecode/plate-line-height/react";
import { CheckIcon, WrapText } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ToolbarButton } from "../menus/toolbars/toolbar";

export function LineHeightDropdownMenu({ ...props }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);
  const state = useLineHeightDropdownMenuState();
  const values = state.values as unknown as string[];
  const { radioGroupProps } = useLineHeightDropdownMenu(state);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={open} tooltip="Line height" isDropdown>
          <WrapText />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="min-w-0" align="start">
        <DropdownMenuRadioGroup {...radioGroupProps}>
          {values.map((value) => (
            <DropdownMenuRadioItem
              key={value}
              className="min-w-[180px] pl-2 *:first:[span]:hidden"
              value={value}
            >
              <span className="pointer-events-none absolute right-2 flex size-3.5 items-center justify-center">
                <DropdownMenuItemIndicator>
                  <CheckIcon />
                </DropdownMenuItemIndicator>
              </span>
              {value}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

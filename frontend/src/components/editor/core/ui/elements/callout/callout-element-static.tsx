import * as React from "react";

import type { SlateElementProps, TElement } from "@udecode/plate";

import { cn } from "@udecode/cn";
import { SlateElement } from "@udecode/plate";
import { EMOJI_FONT_FAMILY } from "../../common/constants";

export function CalloutElementStatic({
  children,
  className,
  ...props
}: SlateElementProps<TElement & { icon?: string; backgroundColor?: string }>) {
  return (
    <SlateElement
      className={cn("my-1 flex rounded-sm bg-muted p-4 pl-3", className)}
      style={{
        backgroundColor: props.element.backgroundColor as string,
      }}
      {...props}
    >
      <div className="flex w-full gap-2 rounded-md">
        <div
          className="size-6 text-[18px] select-none"
          style={{
            fontFamily: EMOJI_FONT_FAMILY,
          }}
        >
          <span data-plate-prevent-deserialization>
            {(props.element.icon as string) || "💡"}
          </span>
        </div>
        <div className="w-full">{children}</div>
      </div>
    </SlateElement>
  );
}

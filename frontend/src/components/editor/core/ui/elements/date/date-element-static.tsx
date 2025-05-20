import * as React from "react";

import type { SlateElementProps } from "@udecode/plate";
import type { TDateElement } from "@udecode/plate-date";

import { SlateElement } from "@udecode/plate";
import { formatDisplayDate } from "../../utils/dateFormatting";

export function DateElementStatic(props: SlateElementProps<TDateElement>) {
  const { element } = props;

  return (
    <SlateElement className="inline-block" {...props}>
      <span className="w-fit rounded-sm bg-muted px-1 text-muted-foreground">
        {formatDisplayDate(element.date)}
      </span>
      {props.children}
    </SlateElement>
  );
}

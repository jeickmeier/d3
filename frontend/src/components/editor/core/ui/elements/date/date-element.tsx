"use client";

import type { TDateElement } from "@udecode/plate-date";
import type { PlateElementProps } from "@udecode/plate/react";

import { PlateElement, useReadOnly } from "@udecode/plate/react";
import { formatDisplayDate } from "../../utils/dateFormatting";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function DateElement(props: PlateElementProps<TDateElement>) {
  const { editor, element } = props;

  const readOnly = useReadOnly();

  const trigger = (
    <span
      className={cn(
        "w-fit cursor-pointer rounded-sm bg-muted px-1 text-muted-foreground",
      )}
      contentEditable={false}
      draggable
    >
      {formatDisplayDate(element.date)}
    </span>
  );

  if (readOnly) {
    return trigger;
  }

  return (
    <PlateElement
      {...props}
      className="inline-block"
      attributes={{
        ...props.attributes,
        contentEditable: false,
      }}
    >
      <Popover>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            selected={new Date(element.date)}
            onSelect={(date) => {
              if (!date) return;

              editor.tf.setNodes(
                { date: date.toDateString() },
                { at: element },
              );
            }}
            mode="single"
            initialFocus
          />
        </PopoverContent>
      </Popover>
      {props.children}
    </PlateElement>
  );
}

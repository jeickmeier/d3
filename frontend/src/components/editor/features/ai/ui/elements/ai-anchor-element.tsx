"use client";

import { type PlateElementProps, PlateElement } from "@udecode/plate/react";

export function AIAnchorElement(props: PlateElementProps) {
  return (
    <PlateElement {...props}>
      {/* Preserve the invisible anchor for the AI cursor positioning */}
      <div className="h-[0.1px]" />

      {/* Render any children so streamed content remains visible */}
      {props.children}
    </PlateElement>
  );
}

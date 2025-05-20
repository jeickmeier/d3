"use client";

import * as React from "react";

import type { TImageElement } from "@udecode/plate-media";
import type { PlateElementProps } from "@udecode/plate/react";

import { useDraggable } from "@udecode/plate-dnd";
import { Image, ImagePlugin, useMediaState } from "@udecode/plate-media/react";
import { ResizableProvider, useResizableValue } from "@udecode/plate-resizable";
import { PlateElement, withHOC } from "@udecode/plate/react";

import { cn } from "@/lib/utils";

import { Caption, CaptionTextarea } from "../../primitives/caption";
import { MediaPopover } from "../../common/media/media-popover";
import {
  mediaResizeHandleVariants,
  Resizable,
  ResizeHandle,
} from "../../primitives/resize-handle";

export const ImageElement = withHOC(
  ResizableProvider,
  function ImageElement(props: PlateElementProps<TImageElement>) {
    const { align = "center", focused, readOnly, selected } = useMediaState();
    const width = useResizableValue("width");

    const { isDragging, handleRef } = useDraggable({
      element: props.element,
    });

    // Safely derive the `alt` attribute from the element's attributes without relying on `any`.
    const alt = React.useMemo<string>(() => {
      const attrs = props.attributes as unknown;

      if (
        attrs &&
        typeof attrs === "object" &&
        "alt" in attrs &&
        typeof (attrs as { alt?: unknown }).alt === "string"
      ) {
        return (attrs as { alt: string }).alt;
      }

      return "";
    }, [props.attributes]);

    return (
      <MediaPopover plugin={ImagePlugin}>
        <PlateElement {...props} className="py-2.5">
          <figure className="group relative m-0" contentEditable={false}>
            <Resizable
              align={align}
              options={{
                align,
                readOnly,
              }}
            >
              <ResizeHandle
                className={mediaResizeHandleVariants({ direction: "left" })}
                options={{ direction: "left" }}
              />
              <Image
                ref={handleRef}
                className={cn(
                  "block w-full max-w-full cursor-pointer object-cover px-0",
                  "rounded-sm",
                  focused && selected && "ring-2 ring-ring ring-offset-2",
                  isDragging && "opacity-50",
                )}
                alt={alt}
              />
              <ResizeHandle
                className={mediaResizeHandleVariants({
                  direction: "right",
                })}
                options={{ direction: "right" }}
              />
            </Resizable>

            <Caption style={{ width }} align={align}>
              <CaptionTextarea
                readOnly={readOnly}
                onFocus={(e) => {
                  e.preventDefault();
                }}
                placeholder="Write a caption..."
              />
            </Caption>
          </figure>

          {props.children}
        </PlateElement>
      </MediaPopover>
    );
  },
);

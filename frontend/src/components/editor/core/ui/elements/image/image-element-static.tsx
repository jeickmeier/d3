import * as React from "react";
import Image from "next/image";

import type { SlateElementProps } from "@udecode/plate";
import type { TCaptionElement } from "@udecode/plate-caption";
import type { TImageElement } from "@udecode/plate-media";

import { NodeApi, SlateElement } from "@udecode/plate";

import { cn } from "@/lib/utils";

export function ImageElementStatic(
  props: SlateElementProps<TImageElement & TCaptionElement & { width: number }>,
) {
  const { align = "center", caption, url, width } = props.element;

  const { alt = "" } =
    props.attributes as React.ImgHTMLAttributes<HTMLImageElement>;

  return (
    <SlateElement {...props} className="py-2.5">
      <figure className="group relative m-0 inline-block" style={{ width }}>
        <div
          className="relative max-w-full min-w-[92px]"
          style={{ textAlign: align }}
        >
          <Image
            className={cn(
              "w-full max-w-full cursor-default object-cover px-0",
              "rounded-sm",
            )}
            alt={alt}
            src={url}
            width={width}
            height={0}
            style={{ height: "auto" }}
          />
          {caption && (
            <figcaption className="mx-auto mt-2 h-[24px] max-w-full">
              {NodeApi.string(caption[0])}
            </figcaption>
          )}
        </div>
      </figure>
      {props.children}
    </SlateElement>
  );
}

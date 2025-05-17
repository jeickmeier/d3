"use client";

import * as React from "react";

import { HEADING_KEYS } from "@udecode/plate-heading";
import { ParagraphPlugin } from "@udecode/plate/react";
import {
  type PlaceholderProps,
  createNodeHOC,
  createNodesHOC,
  usePlaceholderState,
} from "@udecode/plate/react";

import { cn } from "@/lib/utils";

// Narrow the typing of the attributes we expect to receive from Plate.
// We only rely on `className`, but keep the rest of the keys open to avoid
// over-constraining consumers.
type PlateElementAttributes = {
  className?: string;
  placeholder?: string;
  [key: string]: unknown;
};

export const Placeholder = (props: PlaceholderProps): React.ReactNode => {
  // Extract the values we need with explicit casts to keep the type checker and
  // eslint rules satisfied.
  const attributes = (
    props as unknown as { attributes: PlateElementAttributes }
  ).attributes;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const childrenRaw = props.children ?? [];
  const { placeholder } = props;

  const { enabled } = usePlaceholderState(props);

  return React.Children.map(
    childrenRaw as React.ReactElement | readonly React.ReactElement[],
    (child: React.ReactElement) => {
      // React typings default the `child` parameter to `any`, therefore we cast
      // to `React.ReactElement` before cloning to avoid the "unsafe argument"
      // lint error.
      return React.cloneElement(
        child as React.ReactElement<Record<string, unknown>>,
        {
          attributes: {
            ...attributes,
            className: cn(
              attributes.className,
              enabled &&
                "before:absolute before:cursor-text before:opacity-30 before:content-[attr(placeholder)]",
            ),
            placeholder,
          },
        },
      ) as React.ReactElement;
    },
  ) as React.ReactNode;
};

export const withPlaceholder = createNodeHOC(Placeholder);

export const withPlaceholdersPrimitive = createNodesHOC(Placeholder);

// Provide a generic signature so consumers keep their component typings intact
// while avoiding the use of `any`.
export const withPlaceholders = <T extends Record<string, unknown>>(
  components: T,
): T =>
  withPlaceholdersPrimitive(components, [
    {
      key: ParagraphPlugin.key,
      hideOnBlur: true,
      placeholder: "Type a paragraph",
      query: {
        maxLevel: 1,
      },
    },
    {
      key: HEADING_KEYS.h1,
      hideOnBlur: false,
      placeholder: "Untitled",
    },
  ]) as T;

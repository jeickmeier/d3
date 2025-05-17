"use client";

import * as React from "react";

import type { TLinkElement } from "@udecode/plate-link";
import type { PlateElementProps } from "@udecode/plate/react";

import { useLink } from "@udecode/plate-link/react";
import { PlateElement } from "@udecode/plate/react";

export function LinkElement(props: PlateElementProps<TLinkElement>) {
  const { props: linkProps } = useLink({ element: props.element });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { dir: _dir, ...restLinkProps } =
    linkProps as React.AnchorHTMLAttributes<HTMLAnchorElement>;

  return (
    <PlateElement
      {...props}
      {...restLinkProps}
      as="a"
      className="font-medium text-primary underline decoration-primary underline-offset-4"
    >
      {props.children}
    </PlateElement>
  );
}

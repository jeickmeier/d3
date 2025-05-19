"use client";

import React from 'react';

export interface DeserializeImageProps {
  node: {
    url: string;
    alt?: string;
    width?: number | string;
    height?: number | string;
  };
}

export const DeserializeImage: React.FC<DeserializeImageProps> = ({ node }) => {
  return (
    <img
      src={node.url}
      alt={node.alt}
      width={node.width}
      height={node.height}
    />
  );
};

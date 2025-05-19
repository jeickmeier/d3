"use client";

import React from 'react';
import { DeserializeImage, DeserializeImageProps } from './DeserializeImage';
import { DeserializeTable, DeserializeTableProps } from './DeserializeTable';

// Define a more specific type for Plate editor nodes
// This is a simplified version; Plate's actual node structure can be more complex.
export interface PlateNode {
  type?: string;
  text?: string;
  children?: PlateNode[];
  url?: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
  // For table cell, to pass to DeserializeTable, which expects specific node structure
  data?: { 
    isHeader?: boolean;
  };
  // Allow any other properties that might exist on a node
  [key: string]: any;
}

export interface DeserializeNodeProps {
  node: PlateNode | PlateNode[]; // Node can be a single node or an array of nodes
}

export const DeserializeNode: React.FC<DeserializeNodeProps> = ({ node }) => {
  if (Array.isArray(node)) {
    return (
      <>
        {node.map((item, i) => (
          <DeserializeNode key={i} node={item} />
        ))}
      </>
    );
  }

  if (node.text !== undefined) {
    let content: React.ReactNode = node.text;
    if (node.bold) {
      content = <strong>{content}</strong>;
    }
    if (node.italic) {
      content = <em>{content}</em>;
    }
    if (node.underline) {
      content = <u>{content}</u>;
    }
    if (node.code) {
      content = <code>{content}</code>;
    }
    return <>{content}</>;
  }

  if (!node.type) {
    // If it's not a text node and has no type, but has children, render children.
    // This might happen for the root editor object if it's not an array.
    if (node.children) {
      return (
        <>
          {node.children.map((child, i) => (
            <DeserializeNode key={i} node={child} />
          ))}
        </>
      );
    }
    // Otherwise, cannot render this node
    return null;
  }

  const children = node.children?.map((child, i) => (
    <DeserializeNode key={i} node={child} />
  ));

  switch (node.type) {
    case 'p':
      return <p>{children}</p>;
    case 'h1':
      return <h1>{children}</h1>;
    case 'h2':
      return <h2>{children}</h2>;
    case 'h3':
      return <h3>{children}</h3>;
    case 'h4':
      return <h4>{children}</h4>;
    case 'h5':
      return <h5>{children}</h5>;
    case 'h6':
      return <h6>{children}</h6>;
    case 'ul':
      return <ul>{children}</ul>;
    case 'ol':
      return <ol>{children}</ol>;
    case 'li':
      return <li>{children}</li>;
    case 'a':
      return <a href={node.url}>{children}</a>;
    case 'blockquote':
      return <blockquote>{children}</blockquote>;
    case 'code_block':
      // Assuming children of code_block are text nodes or lines of text
      // If children are `code_line` type, this might need adjustment
      // For simple text children, this should work.
      return <pre><code>{children}</code></pre>;
    case 'img': // Plate might use 'img' or 'image'
    case 'image':
      // Pass the whole node as DeserializeImageProps expects a 'node' prop with url, alt etc.
      return <DeserializeImage node={node as DeserializeImageProps['node']} />;
    case 'table':
      // Pass the whole node and the DeserializeNode function itself for recursion
      return <DeserializeTable node={node as DeserializeTableProps['node']} deserializeNode={DeserializeNode} />;
    
    // Handling for table elements if they appear outside a proper table structure (should ideally not happen)
    // Or if they are directly passed to DeserializeNode (e.g. a single cell)
    // These are basic fallbacks, actual table rendering is handled by DeserializeTable
    case 'tr':
        return <tr>{children}</tr>;
    case 'td':
        return <td>{children}</td>;
    case 'th':
        return <th>{children}</th>;

    default:
      // If type is unknown, but there are children, render them.
      // This is a fallback to ensure content is not lost.
      if (children && children.length > 0) {
        return <>{children}</>;
      }
      console.warn('Unknown node type encountered:', node.type, node);
      return null; // Or <></>
  }
};

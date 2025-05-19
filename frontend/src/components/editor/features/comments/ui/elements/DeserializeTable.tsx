"use client";

import React from 'react';

// Define types for table cell and row nodes based on Plate's structure
interface TableCellNode {
  type: 'td' | 'th';
  children: any[]; // Content nodes for the cell
  data?: {
    isHeader?: boolean;
  };
}

interface TableRowNode {
  type: 'tr';
  children: TableCellNode[];
}

export interface DeserializeTableProps {
  node: {
    children: TableRowNode[];
  };
  deserializeNode: (node: any) => JSX.Element;
}

export const DeserializeTable: React.FC<DeserializeTableProps> = ({ node, deserializeNode }) => {
  return (
    <table>
      <tbody>
        {node.children.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.children.map((cell, cellIndex) => {
              const CellComponent = cell.data?.isHeader ? 'th' : 'td';
              return (
                <CellComponent key={cellIndex}>
                  {cell.children.map((cellContentNode, contentIndex) => (
                    <React.Fragment key={contentIndex}>
                      {deserializeNode(cellContentNode)}
                    </React.Fragment>
                  ))}
                </CellComponent>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { DeserializeTable, DeserializeTableProps } from '../DeserializeTable';
import { PlateNode } from '../DeserializeNode'; // Import PlateNode for type safety

// Mock the DeserializeNode component
const mockDeserializeNodeImplementation = jest.fn((node: PlateNode) => {
  if (node.text) return <>{node.text}</>;
  // For more complex children, this mock might need to be smarter
  // or we rely on checking if it was called with the correct node.
  return <>mocked_content</>; 
});

jest.mock('../DeserializeNode', () => ({
  DeserializeNode: jest.fn((props) => mockDeserializeNodeImplementation(props.node)),
}));


describe('DeserializeTable', () => {
  beforeEach(() => {
    // Clear mock calls before each test
    mockDeserializeNodeImplementation.mockClear();
  });

  const simpleTableNode: DeserializeTableProps['node'] = {
    children: [ // rows
      { 
        type: 'tr', 
        children: [ // cells
          { type: 'td', children: [{ text: 'R1C1' }] },
          { type: 'td', children: [{ text: 'R1C2' }] }
        ] 
      },
      { 
        type: 'tr', 
        children: [
          { type: 'td', children: [{ text: 'R2C1' }] },
          { type: 'td', children: [{ text: 'R2C2' }] }
        ]
      }
    ]
  };

  const tableNodeWithHeaders: DeserializeTableProps['node'] = {
    children: [
      { 
        type: 'tr', 
        children: [
          { type: 'th', data: { isHeader: true }, children: [{ text: 'Header 1' }] },
          { type: 'th', data: { isHeader: true }, children: [{ text: 'Header 2' }] }
        ] 
      },
      { 
        type: 'tr', 
        children: [
          { type: 'td', children: [{ text: 'Data 1' }] },
          { type: 'td', children: [{ text: 'Data 2' }] }
        ]
      }
    ]
  };

  test('renders a table tag', () => {
    render(<DeserializeTable node={simpleTableNode} deserializeNode={mockDeserializeNodeImplementation} />);
    const tableElement = screen.getByRole('table');
    expect(tableElement).toBeInTheDocument();
  });

  test('renders the correct number of rows (tr)', () => {
    const { container } = render(<DeserializeTable node={simpleTableNode} deserializeNode={mockDeserializeNodeImplementation} />);
    const rows = container.querySelectorAll('tr');
    expect(rows.length).toBe(simpleTableNode.children.length); // 2 rows
  });

  test('renders the correct number of cells (td) per row', () => {
    const { container } = render(<DeserializeTable node={simpleTableNode} deserializeNode={mockDeserializeNodeImplementation} />);
    const rows = container.querySelectorAll('tr');
    expect(rows.length).toBe(2);
    const cellsInRow1 = rows[0].querySelectorAll('td');
    expect(cellsInRow1.length).toBe(simpleTableNode.children[0].children.length); // 2 cells
    const cellsInRow2 = rows[1].querySelectorAll('td');
    expect(cellsInRow2.length).toBe(simpleTableNode.children[1].children.length); // 2 cells
  });

  test('renders th for header cells and td for data cells', () => {
    render(<DeserializeTable node={tableNodeWithHeaders} deserializeNode={mockDeserializeNodeImplementation} />);
    const headerCells = screen.getAllByRole('columnheader');
    expect(headerCells.length).toBe(2);
    headerCells.forEach(cell => expect(cell.tagName).toBe('TH'));

    const dataCells = screen.getAllByRole('cell');
    expect(dataCells.length).toBe(2);
    dataCells.forEach(cell => expect(cell.tagName).toBe('TD'));
  });

  test('calls deserializeNode for the content of each cell', () => {
    render(<DeserializeTable node={tableNodeWithHeaders} deserializeNode={mockDeserializeNodeImplementation} />);
    
    // Header 1 content
    expect(mockDeserializeNodeImplementation).toHaveBeenCalledWith(
      tableNodeWithHeaders.children[0].children[0].children[0] // { text: 'Header 1' }
    );
    // Header 2 content
    expect(mockDeserializeNodeImplementation).toHaveBeenCalledWith(
      tableNodeWithHeaders.children[0].children[1].children[0] // { text: 'Header 2' }
    );
    // Data 1 content
    expect(mockDeserializeNodeImplementation).toHaveBeenCalledWith(
      tableNodeWithHeaders.children[1].children[0].children[0] // { text: 'Data 1' }
    );
    // Data 2 content
    expect(mockDeserializeNodeImplementation).toHaveBeenCalledWith(
      tableNodeWithHeaders.children[1].children[1].children[0] // { text: 'Data 2' }
    );

    expect(mockDeserializeNodeImplementation).toHaveBeenCalledTimes(4);
  });

  test('renders cell content based on mockDeserializeNode output', () => {
    render(<DeserializeTable node={tableNodeWithHeaders} deserializeNode={mockDeserializeNodeImplementation} />);
    expect(screen.getByText('Header 1')).toBeInTheDocument();
    expect(screen.getByText('Header 2')).toBeInTheDocument();
    expect(screen.getByText('Data 1')).toBeInTheDocument();
    expect(screen.getByText('Data 2')).toBeInTheDocument();
  });

  test('handles table with multiple content nodes in a single cell', () => {
    const complexCellNode: DeserializeTableProps['node'] = {
      children: [
        {
          type: 'tr',
          children: [
            { 
              type: 'td', 
              children: [
                { text: 'Part 1. ' }, 
                { type: 'a', url: '#', children: [{text: 'Link'}] }, // This part won't be "Link" due to mock
                { text: ' Part 2.' }
              ] 
            },
          ]
        }
      ]
    };
    render(<DeserializeTable node={complexCellNode} deserializeNode={mockDeserializeNodeImplementation} />);
    
    // Check that deserializeNode was called for each part of the cell content
    expect(mockDeserializeNodeImplementation).toHaveBeenCalledWith(complexCellNode.children[0].children[0].children[0]);
    expect(mockDeserializeNodeImplementation).toHaveBeenCalledWith(complexCellNode.children[0].children[0].children[1]);
    expect(mockDeserializeNodeImplementation).toHaveBeenCalledWith(complexCellNode.children[0].children[0].children[2]);
    expect(mockDeserializeNodeImplementation).toHaveBeenCalledTimes(3);

    // Check rendered content based on mock (which renders text or 'mocked_content')
    expect(screen.getByText('Part 1.')).toBeInTheDocument();
    expect(screen.getByText('Part 2.')).toBeInTheDocument();
    // The link node will be rendered as 'mocked_content' by our current simple mock
    expect(screen.getAllByText('mocked_content').length).toBeGreaterThanOrEqual(1); 
  });

  test('handles empty table', () => {
    const emptyTable: DeserializeTableProps['node'] = { children: [] };
    const { container } = render(<DeserializeTable node={emptyTable} deserializeNode={mockDeserializeNodeImplementation} />);
    const tableElement = screen.getByRole('table');
    expect(tableElement).toBeInTheDocument();
    expect(container.querySelectorAll('tr').length).toBe(0);
    expect(mockDeserializeNodeImplementation).not.toHaveBeenCalled();
  });

  test('handles table with empty rows', () => {
    const tableWithEmptyRows: DeserializeTableProps['node'] = { 
      children: [
        { type: 'tr', children: [] },
        { type: 'tr', children: [] }
      ] 
    };
    const { container } = render(<DeserializeTable node={tableWithEmptyRows} deserializeNode={mockDeserializeNodeImplementation} />);
    const tableElement = screen.getByRole('table');
    expect(tableElement).toBeInTheDocument();
    expect(container.querySelectorAll('tr').length).toBe(2);
    expect(container.querySelectorAll('td').length).toBe(0);
    expect(container.querySelectorAll('th').length).toBe(0);
    expect(mockDeserializeNodeImplementation).not.toHaveBeenCalled();
  });

});

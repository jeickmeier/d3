import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { DeserializeNode, PlateNode } from '../DeserializeNode';
import { DeserializeImageProps } from '../DeserializeImage';
import { DeserializeTableProps } from '../DeserializeTable';

// Mock DeserializeImage
const mockDeserializeImageImplementation = jest.fn();
jest.mock('../DeserializeImage', () => ({
  DeserializeImage: jest.fn((props: DeserializeImageProps) => {
    mockDeserializeImageImplementation(props);
    // Render a placeholder or basic img for presence checking
    return <img src={props.node.url} alt={props.node.alt || 'mocked-image'} />;
  }),
}));

// Mock DeserializeTable
const mockDeserializeTableImplementation = jest.fn();
jest.mock('../DeserializeTable', () => ({
  DeserializeTable: jest.fn((props: DeserializeTableProps) => {
    mockDeserializeTableImplementation(props);
    // Render a placeholder table
    return <table data-testid="mock-table"><tbody><tr><td>Mocked Table</td></tr></tbody></table>;
  }),
}));


describe('DeserializeNode', () => {
  beforeEach(() => {
    mockDeserializeImageImplementation.mockClear();
    mockDeserializeTableImplementation.mockClear();
  });

  test('renders simple text node', () => {
    const node: PlateNode = { text: 'Hello World' };
    render(<DeserializeNode node={node} />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  test('renders bold text', () => {
    const node: PlateNode = { text: 'Bold text', bold: true };
    render(<DeserializeNode node={node} />);
    const strongElement = screen.getByText('Bold text');
    expect(strongElement.tagName).toBe('STRONG');
  });

  test('renders italic text', () => {
    const node: PlateNode = { text: 'Italic text', italic: true };
    render(<DeserializeNode node={node} />);
    const emElement = screen.getByText('Italic text');
    expect(emElement.tagName).toBe('EM');
  });

  test('renders underline text', () => {
    const node: PlateNode = { text: 'Underlined text', underline: true };
    render(<DeserializeNode node={node} />);
    const uElement = screen.getByText('Underlined text');
    expect(uElement.tagName).toBe('U');
  });

  test('renders code text (inline)', () => {
    const node: PlateNode = { text: 'Inline code', code: true };
    render(<DeserializeNode node={node} />);
    const codeElement = screen.getByText('Inline code');
    expect(codeElement.tagName).toBe('CODE');
  });

  test('renders paragraph node', () => {
    const node: PlateNode = { type: 'p', children: [{ text: 'Paragraph content.' }] };
    render(<DeserializeNode node={node} />);
    const pElement = screen.getByText('Paragraph content.');
    expect(pElement.tagName).toBe('P');
  });

  test('renders heading nodes (h1-h6)', () => {
    for (let i = 1; i <= 6; i++) {
      const node: PlateNode = { type: `h${i}` as PlateNode['type'], children: [{ text: `Heading ${i}` }] };
      render(<DeserializeNode node={node} />);
      const headingElement = screen.getByText(`Heading ${i}`);
      expect(headingElement.tagName).toBe(`H${i}`);
    }
  });

  test('renders unordered list', () => {
    const node: PlateNode = {
      type: 'ul',
      children: [
        { type: 'li', children: [{ text: 'Item 1' }] },
        { type: 'li', children: [{ text: 'Item 2' }] },
      ],
    };
    render(<DeserializeNode node={node} />);
    const ulElement = screen.getByRole('list'); // ul and ol have this role
    expect(ulElement.tagName).toBe('UL');
    expect(screen.getByText('Item 1').tagName).toBe('LI');
    expect(screen.getByText('Item 2').tagName).toBe('LI');
  });

  test('renders ordered list', () => {
    const node: PlateNode = {
      type: 'ol',
      children: [
        { type: 'li', children: [{ text: 'First item' }] },
        { type: 'li', children: [{ text: 'Second item' }] },
      ],
    };
    render(<DeserializeNode node={node} />);
    const olElement = screen.getByRole('list');
    expect(olElement.tagName).toBe('OL');
    expect(screen.getByText('First item').tagName).toBe('LI');
    expect(screen.getByText('Second item').tagName).toBe('LI');
  });

  test('renders link node', () => {
    const node: PlateNode = {
      type: 'a',
      url: 'https://example.com',
      children: [{ text: 'Link text' }],
    };
    render(<DeserializeNode node={node} />);
    const aElement = screen.getByText('Link text') as HTMLAnchorElement;
    expect(aElement.tagName).toBe('A');
    expect(aElement.href).toBe('https://example.com/'); // Browsers often normalize href
  });

  test('renders blockquote node', () => {
    const node: PlateNode = {
      type: 'blockquote',
      children: [{ text: 'Quoted text.' }],
    };
    render(<DeserializeNode node={node} />);
    const blockquoteElement = screen.getByText('Quoted text.');
    // Check parent is blockquote
    expect(blockquoteElement.parentElement?.tagName).toBe('BLOCKQUOTE');
  });

  test('renders code block node', () => {
    const node: PlateNode = {
      type: 'code_block',
      children: [{ text: 'const x = 10;' }],
    };
    render(<DeserializeNode node={node} />);
    const codeElement = screen.getByText('const x = 10;');
    expect(codeElement.tagName).toBe('CODE');
    expect(codeElement.parentElement?.tagName).toBe('PRE');
  });
  
  test('renders code block with multiple lines (children)', () => {
    const node: PlateNode = {
      type: 'code_block',
      children: [
        { text: 'function greet() {' },
        { type: 'p', children: [{ text: '  return "Hello";' }] }, // Test with a nested paragraph for children
        { text: '}' }
      ],
    };
    render(<DeserializeNode node={node} />);
    const preElement = screen.getByRole('code').parentElement; // `code` is role of pre in some setups, or find by tag
    expect(preElement?.tagName).toBe('PRE');
    expect(within(preElement!).getByText('function greet() {')).toBeInTheDocument();
    // The <p> inside PRE>CODE will be rendered as a P tag by DeserializeNode
    const pInCode = within(preElement!).getByText('return "Hello";');
    expect(pInCode).toBeInTheDocument(); 
    expect(pInCode.tagName).toBe('P'); // as per current DeserializeNode logic for children
    expect(within(preElement!).getByText('}')).toBeInTheDocument();
  });


  test('delegates to DeserializeImage for image node', () => {
    const imageNode: PlateNode = {
      type: 'img', // or 'image'
      url: 'https://example.com/image.png',
      alt: 'Test Image',
      width: 100,
      height: '100px',
    };
    render(<DeserializeNode node={imageNode} />);
    expect(mockDeserializeImageImplementation).toHaveBeenCalledTimes(1);
    // The props passed to DeserializeImage's 'node' prop should be the imageNode itself
    expect(mockDeserializeImageImplementation).toHaveBeenCalledWith({ node: imageNode });
    expect(screen.getByAltText('Test Image')).toBeInTheDocument(); // Check if mock rendered something
  });
  
  test('delegates to DeserializeImage for "image" type node', () => {
    const imageNode: PlateNode = {
      type: 'image', // Test the alternative 'image' type
      url: 'https://example.com/image2.png',
      alt: 'Test Image 2',
    };
    render(<DeserializeNode node={imageNode} />);
    expect(mockDeserializeImageImplementation).toHaveBeenCalledTimes(1);
    expect(mockDeserializeImageImplementation).toHaveBeenCalledWith({ node: imageNode });
    expect(screen.getByAltText('Test Image 2')).toBeInTheDocument();
  });


  test('delegates to DeserializeTable for table node', () => {
    const tableNode: PlateNode = {
      type: 'table',
      children: [ /* simplified table structure for this test */ ],
    };
    render(<DeserializeNode node={tableNode} />);
    expect(mockDeserializeTableImplementation).toHaveBeenCalledTimes(1);
    expect(mockDeserializeTableImplementation).toHaveBeenCalledWith({
      node: tableNode,
      deserializeNode: DeserializeNode, // Check that DeserializeNode itself is passed
    });
    expect(screen.getByTestId('mock-table')).toBeInTheDocument();
  });

  test('renders an array of nodes', () => {
    const nodes: PlateNode[] = [
      { type: 'p', children: [{ text: 'First paragraph.' }] },
      { text: 'Just some text. ' },
      { text: 'Bold text.', bold: true },
    ];
    render(<DeserializeNode node={nodes} />);
    expect(screen.getByText('First paragraph.')).toBeInTheDocument();
    expect(screen.getByText('Just some text.')).toBeInTheDocument();
    const boldElement = screen.getByText('Bold text.');
    expect(boldElement).toBeInTheDocument();
    expect(boldElement.tagName).toBe('STRONG');
  });

  test('renders children if node type is unknown but has children', () => {
    const node: PlateNode = {
      type: 'unknown_type_with_children',
      children: [{ text: 'Child text of unknown type' }],
    };
    render(<DeserializeNode node={node} />);
    expect(screen.getByText('Child text of unknown type')).toBeInTheDocument();
  });

  test('renders nothing and logs warning for unknown leaf node type (no children, no text)', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const node: PlateNode = { type: 'unknown_leaf_type' };
    const { container } = render(<DeserializeNode node={node} />);
    expect(container.firstChild).toBeNull();
    expect(consoleWarnSpy).toHaveBeenCalledWith('Unknown node type encountered:', 'unknown_leaf_type', node);
    consoleWarnSpy.mockRestore();
  });
  
  test('renders children if node has no type but has children (e.g. root node)', () => {
    const node: PlateNode = {
      // No 'type' property
      children: [
        { type: 'p', children: [{ text: 'Content from typeless parent' }] }
      ]
    };
    render(<DeserializeNode node={node} />);
    expect(screen.getByText('Content from typeless parent')).toBeInTheDocument();
    expect(screen.getByText('Content from typeless parent').tagName).toBe('P');
  });

  test('renders nothing for a node with no type and no children and no text', () => {
    const node: PlateNode = {
      // No 'type', no 'children', no 'text'
      someOtherProp: 'value' // Arbitrary other property
    };
    const { container } = render(<DeserializeNode node={node} />);
    expect(container.firstChild).toBeNull();
  });

  test('renders basic table elements (tr, td, th) if encountered directly', () => {
    const trNode: PlateNode = { type: 'tr', children: [{ type: 'td', children: [{text: "Cell in TR"}]}] };
    render(<DeserializeNode node={trNode} />);
    const cellInTr = screen.getByText("Cell in TR");
    expect(cellInTr.tagName).toBe("TD");
    expect(cellInTr.parentElement?.tagName).toBe("TR");

    const tdNode: PlateNode = { type: 'td', children: [{text: "Direct TD"}] };
    render(<DeserializeNode node={tdNode} />);
    expect(screen.getByText("Direct TD").tagName).toBe("TD");
    
    const thNode: PlateNode = { type: 'th', children: [{text: "Direct TH"}] };
    render(<DeserializeNode node={thNode} />);
    expect(screen.getByText("Direct TH").tagName).toBe("TH");
  });

});

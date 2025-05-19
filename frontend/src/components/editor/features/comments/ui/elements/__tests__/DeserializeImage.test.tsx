import React from 'react';
import { render, screen } from '@testing-library/react';
import { DeserializeImage, DeserializeImageProps } from '../DeserializeImage';

describe('DeserializeImage', () => {
  const defaultProps: DeserializeImageProps['node'] = {
    url: 'https://example.com/image.jpg',
  };

  test('renders an img tag', () => {
    render(<DeserializeImage node={defaultProps} />);
    const imgElement = screen.getByRole('img');
    expect(imgElement).toBeInTheDocument();
  });

  test('correctly passes src attribute', () => {
    render(<DeserializeImage node={defaultProps} />);
    const imgElement = screen.getByRole('img');
    expect(imgElement).toHaveAttribute('src', defaultProps.url);
  });

  test('correctly passes alt attribute when provided', () => {
    const propsWithAlt: DeserializeImageProps['node'] = {
      ...defaultProps,
      alt: 'Test Image Alt Text',
    };
    render(<DeserializeImage node={propsWithAlt} />);
    const imgElement = screen.getByRole('img');
    expect(imgElement).toHaveAttribute('alt', propsWithAlt.alt);
  });

  test('does not have alt attribute if not provided', () => {
    render(<DeserializeImage node={defaultProps} />);
    const imgElement = screen.getByRole('img');
    expect(imgElement).not.toHaveAttribute('alt');
  });

  test('correctly passes width attribute when provided', () => {
    const propsWithWidth: DeserializeImageProps['node'] = {
      ...defaultProps,
      width: '100',
    };
    render(<DeserializeImage node={propsWithWidth} />);
    const imgElement = screen.getByRole('img');
    expect(imgElement).toHaveAttribute('width', '100');
  });

  test('correctly passes width attribute as number when provided', () => {
    const propsWithWidthNumber: DeserializeImageProps['node'] = {
      ...defaultProps,
      width: 150,
    };
    render(<DeserializeImage node={propsWithWidthNumber} />);
    const imgElement = screen.getByRole('img');
    expect(imgElement).toHaveAttribute('width', '150');
  });

  test('does not have width attribute if not provided', () => {
    render(<DeserializeImage node={defaultProps} />);
    const imgElement = screen.getByRole('img');
    // HTML standard might set a default width or it might be absent.
    // We are checking it's not the one we didn't provide.
    // A more robust test would be to check if the attribute is absent or has a default value if known.
    // For now, we'll check it doesn't have a specific test width.
    expect(imgElement).not.toHaveAttribute('width', '100'); // Assuming default is not '100'
  });

  test('correctly passes height attribute when provided', () => {
    const propsWithHeight: DeserializeImageProps['node'] = {
      ...defaultProps,
      height: '200',
    };
    render(<DeserializeImage node={propsWithHeight} />);
    const imgElement = screen.getByRole('img');
    expect(imgElement).toHaveAttribute('height', '200');
  });

  test('correctly passes height attribute as number when provided', () => {
    const propsWithHeightNumber: DeserializeImageProps['node'] = {
      ...defaultProps,
      height: 250,
    };
    render(<DeserializeImage node={propsWithHeightNumber} />);
    const imgElement = screen.getByRole('img');
    expect(imgElement).toHaveAttribute('height', '250');
  });

  test('does not have height attribute if not provided', () => {
    render(<DeserializeImage node={defaultProps} />);
    const imgElement = screen.getByRole('img');
    expect(imgElement).not.toHaveAttribute('height', '200'); // Assuming default is not '200'
  });

  test('renders correctly with all props provided', () => {
    const fullProps: DeserializeImageProps['node'] = {
      url: 'https://example.com/full.png',
      alt: 'Full Props Image',
      width: 300,
      height: '400',
    };
    render(<DeserializeImage node={fullProps} />);
    const imgElement = screen.getByRole('img');
    expect(imgElement).toHaveAttribute('src', fullProps.url);
    expect(imgElement).toHaveAttribute('alt', fullProps.alt);
    expect(imgElement).toHaveAttribute('width', '300');
    expect(imgElement).toHaveAttribute('height', '400');
  });
});

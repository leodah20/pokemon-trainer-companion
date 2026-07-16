import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { Text } from 'react-native';
import { ErrorBoundary } from './ErrorBoundary';

function Bomb(): React.JSX.Element {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  // React logs caught errors to the console by default; suppress the expected noise for this test.
  const originalConsoleError = console.error;
  beforeEach(() => {
    console.error = jest.fn();
  });
  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('renders children normally when nothing throws', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <ErrorBoundary>
          <Text>All good</Text>
        </ErrorBoundary>,
      );
    });
    expect(tree!.root.findByType(Text).props.children).toBe('All good');
  });

  it('shows a fallback instead of crashing when a child throws', async () => {
    let tree: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      tree = ReactTestRenderer.create(
        <ErrorBoundary>
          <Bomb />
        </ErrorBoundary>,
      );
    });
    const texts = tree!.root.findAllByType(Text).map((node) => node.props.children);
    expect(texts.flat().join(' ')).toContain('Something went wrong');
  });
});

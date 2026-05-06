import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DisplayProvider, useDisplay } from '../DisplayProvider';

beforeAll(() => {
  globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
});

describe('DisplayProvider', () => {
  it('provides design dimensions from props', () => {
    function Info() {
      const { designWidth, designHeight, aspectRatio } = useDisplay();
      return (
        <div>
          <span data-testid="dw">{designWidth}</span>
          <span data-testid="dh">{designHeight}</span>
          <span data-testid="ar">{aspectRatio}</span>
        </div>
      );
    }
    render(
      <DisplayProvider designWidth={1280} designHeight={960}>
        <Info />
      </DisplayProvider>,
    );
    expect(screen.getByTestId('dw').textContent).toBe('1280');
    expect(screen.getByTestId('dh').textContent).toBe('960');
    expect(Number(screen.getByTestId('ar').textContent)).toBeCloseTo(4 / 3);
  });

  it('useDisplay throws outside DisplayProvider', () => {
    function Bad() {
      useDisplay();
      return null;
    }
    const err = console.error;
    console.error = () => {};
    expect(() => render(<Bad />)).toThrow();
    console.error = err;
  });
});

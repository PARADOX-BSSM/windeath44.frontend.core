import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DisplayProvider, useDisplay } from '../DisplayProvider';

beforeAll(() => {
  globalThis.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }));
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
});

describe('DisplayProvider', () => {
  it('provides default aspectRatio', () => {
    function Info() {
      const { aspectRatio } = useDisplay();
      return <span data-testid="ar">{aspectRatio}</span>;
    }
    render(
      <DisplayProvider>
        <Info />
      </DisplayProvider>,
    );
    expect(Number(screen.getByTestId('ar').textContent)).toBeCloseTo(4 / 3);
  });

  it('accepts custom aspectRatio prop', () => {
    function Info() {
      const { aspectRatio } = useDisplay();
      return <span data-testid="ar">{aspectRatio}</span>;
    }
    render(
      <DisplayProvider aspectRatio={16 / 9}>
        <Info />
      </DisplayProvider>,
    );
    expect(Number(screen.getByTestId('ar').textContent)).toBeCloseTo(16 / 9);
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

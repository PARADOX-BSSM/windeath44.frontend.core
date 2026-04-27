import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Desktop } from '../components/Desktop';
import { WindowLayer } from '../components/WindowLayer';

describe('Desktop', () => {
  it('renders with position:fixed and inset:0', () => {
    const { container } = render(<Desktop />);
    const el = container.querySelector('[data-windeath44-desktop]') as HTMLElement;
    expect(el.style.position).toBe('fixed');
    expect(el.style.inset === '0' || el.style.inset === '0px').toBe(true);
  });

  it('applies wallpaper as background', () => {
    const { container } = render(<Desktop wallpaper="#1e1e2e" />);
    const el = container.querySelector('[data-windeath44-desktop]') as HTMLElement;
    expect(el.style.background).toBeTruthy();
  });

  it('renders children', () => {
    render(
      <Desktop>
        <span data-testid="child">taskbar</span>
      </Desktop>,
    );
    expect(screen.getByTestId('child')).toBeTruthy();
  });

  it('merges style prop', () => {
    const { container } = render(<Desktop style={{ cursor: 'crosshair' }} />);
    const el = container.querySelector('[data-windeath44-desktop]') as HTMLElement;
    expect(el.style.cursor).toBe('crosshair');
  });

  it('includes WindowLayer inside', () => {
    const { container } = render(<Desktop />);
    expect(container.querySelector('[data-windeath44-window-layer]')).toBeTruthy();
  });
});

describe('WindowLayer', () => {
  it('renders with position:absolute and inset:0', () => {
    const { container } = render(<WindowLayer />);
    const el = container.querySelector('[data-windeath44-window-layer]') as HTMLElement;
    expect(el.style.position).toBe('absolute');
    expect(el.style.inset === '0' || el.style.inset === '0px').toBe(true);
  });

  it('renders children', () => {
    render(
      <WindowLayer>
        <div data-testid="win">window</div>
      </WindowLayer>,
    );
    expect(screen.getByTestId('win')).toBeTruthy();
  });
});

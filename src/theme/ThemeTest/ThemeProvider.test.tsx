import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../ThemeProvider';
import { lightTokens } from '../themes/light';

function ThemeDisplay() {
  const { themeId, tokens, setTheme, registerTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-id">{themeId}</span>
      <span data-testid="bg">{tokens.colorBackground}</span>
      <button onClick={() => setTheme('light')}>set-light</button>
      <button onClick={() => setTheme('dark')}>set-dark</button>
      <button
        onClick={() =>
          registerTheme('custom', { ...lightTokens, colorBackground: '#abcdef' })
        }
      >
        register-custom
      </button>
      <button onClick={() => setTheme('custom')}>set-custom</button>
    </div>
  );
}

describe('ThemeProvider', () => {
  it('sets data-theme attribute on documentElement with default theme', () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <ThemeDisplay />
      </ThemeProvider>,
    );
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('setTheme changes themeId and data-theme attribute', async () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <ThemeDisplay />
      </ThemeProvider>,
    );
    await act(async () => {
      fireEvent.click(screen.getByText('set-light'));
    });
    expect(screen.getByTestId('theme-id').textContent).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('tokens update when theme changes', async () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <ThemeDisplay />
      </ThemeProvider>,
    );
    await act(async () => {
      fireEvent.click(screen.getByText('set-light'));
    });
    expect(screen.getByTestId('bg').textContent).toBe(lightTokens.colorBackground);
  });

  it('registerTheme then setTheme applies custom tokens', async () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <ThemeDisplay />
      </ThemeProvider>,
    );
    await act(async () => {
      fireEvent.click(screen.getByText('register-custom'));
      fireEvent.click(screen.getByText('set-custom'));
    });
    expect(screen.getByTestId('bg').textContent).toBe('#abcdef');
    expect(document.documentElement.getAttribute('data-theme')).toBe('custom');
  });

  it('useTheme throws outside ThemeProvider', () => {
    function Bad() {
      useTheme();
      return null;
    }
    const err = console.error;
    console.error = () => {};
    expect(() => render(<Bad />)).toThrow();
    console.error = err;
  });
});

import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { KeymapProvider } from '../KeymapProvider';
import { useKeybinding } from '../hooks/useKeybinding';

function Shortcut({ onTrigger = vi.fn(), enabled = true }: { onTrigger?: () => void; enabled?: boolean }) {
  useKeybinding('Ctrl+K', onTrigger, { enabled });
  return <span data-testid="target">target</span>;
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return <KeymapProvider>{children}</KeymapProvider>;
}

describe('useKeybinding', () => {
  it('handler is called on matching keydown', async () => {
    const handler = vi.fn();
    render(<Wrapper><Shortcut onTrigger={handler} /></Wrapper>);
    await act(async () => {
      fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    });
    expect(handler).toHaveBeenCalledOnce();
  });

  it('handler is NOT called for non-matching key', async () => {
    const handler = vi.fn();
    render(<Wrapper><Shortcut onTrigger={handler} /></Wrapper>);
    await act(async () => {
      fireEvent.keyDown(document, { key: 'j', ctrlKey: true });
    });
    expect(handler).not.toHaveBeenCalled();
  });

  it('unmounting removes the listener', async () => {
    const handler = vi.fn();
    const { unmount } = render(<Wrapper><Shortcut onTrigger={handler} /></Wrapper>);
    unmount();
    await act(async () => {
      fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    });
    expect(handler).not.toHaveBeenCalled();
  });

  it('enabled=false skips registration', async () => {
    const handler = vi.fn();
    render(<Wrapper><Shortcut onTrigger={handler} enabled={false} /></Wrapper>);
    await act(async () => {
      fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    });
    expect(handler).not.toHaveBeenCalled();
  });

  it('useKeymap throws outside KeymapProvider', () => {
    function Bad() {
      useKeybinding('Ctrl+K', vi.fn());
      return null;
    }
    const err = console.error;
    console.error = () => {};
    expect(() => render(<Bad />)).toThrow();
    console.error = err;
  });
});

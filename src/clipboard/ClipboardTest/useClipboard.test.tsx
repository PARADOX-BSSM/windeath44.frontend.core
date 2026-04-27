import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ClipboardProvider, useClipboard } from '../ClipboardProvider';

function ClipboardTester() {
  const { data, write, clear, writeToSystem, readFromSystem } = useClipboard();
  return (
    <div>
      <span data-testid="data">{data ? JSON.stringify(data) : 'null'}</span>
      <button onClick={() => write({ type: 'text', text: 'hello' })}>write</button>
      <button onClick={() => clear()}>clear</button>
      <button onClick={() => writeToSystem('sys-text')}>write-sys</button>
      <button onClick={async () => { await readFromSystem(); }}>read-sys</button>
    </div>
  );
}

function Wrapper() {
  return <ClipboardProvider><ClipboardTester /></ClipboardProvider>;
}

describe('useClipboard', () => {
  it('write then read returns same data', async () => {
    render(<Wrapper />);
    await act(async () => { fireEvent.click(screen.getByText('write')); });
    expect(screen.getByTestId('data').textContent).toContain('hello');
  });

  it('clear sets data to null', async () => {
    render(<Wrapper />);
    await act(async () => { fireEvent.click(screen.getByText('write')); });
    await act(async () => { fireEvent.click(screen.getByText('clear')); });
    expect(screen.getByTestId('data').textContent).toBe('null');
  });

  it('writeToSystem calls navigator.clipboard.writeText', async () => {
    const mock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: mock, readText: vi.fn().mockResolvedValue('') }, configurable: true });
    render(<Wrapper />);
    await act(async () => { fireEvent.click(screen.getByText('write-sys')); });
    expect(mock).toHaveBeenCalledWith('sys-text');
  });

  it('readFromSystem returns null when clipboard API unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
    render(<Wrapper />);
    // should not throw
    await act(async () => { fireEvent.click(screen.getByText('read-sys')); });
    expect(screen.getByTestId('data').textContent).toBe('null');
  });

  it('useClipboard throws outside provider', () => {
    function Bad() { useClipboard(); return null; }
    const err = console.error;
    console.error = () => {};
    expect(() => render(<Bad />)).toThrow();
    console.error = err;
  });
});

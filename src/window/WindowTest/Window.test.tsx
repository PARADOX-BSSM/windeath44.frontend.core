import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WindowManagerProvider, useWindowManager } from '../WindowManagerProvider';
import { Window } from '../components/Window';
import { _resetKernel } from '../../kernel/Kernel';

beforeEach(() => {
  _resetKernel();
});

function TestWindowRenderer() {
  const { windows, open } = useWindowManager();
  return (
    <>
      <button
        data-testid="open-btn"
        onClick={() => open({ pid: 1, title: 'Test App', children: <span data-testid="content">hello</span> })}
      />
      {windows.map((w) => (
        <Window key={w.id} window={w} />
      ))}
    </>
  );
}

function Wrapper() {
  return (
    <WindowManagerProvider>
      <TestWindowRenderer />
    </WindowManagerProvider>
  );
}

describe('Window component', () => {
  it('renders window title after open', () => {
    render(<Wrapper />);
    fireEvent.click(screen.getByTestId('open-btn'));
    expect(screen.getByText('Test App')).toBeTruthy();
  });

  it('renders window content', () => {
    render(<Wrapper />);
    fireEvent.click(screen.getByTestId('open-btn'));
    expect(screen.getByTestId('content')).toBeTruthy();
  });

  it('close button removes the window', () => {
    render(<Wrapper />);
    fireEvent.click(screen.getByTestId('open-btn'));
    expect(screen.getByText('Test App')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'close' }));
    expect(screen.queryByText('Test App')).toBeNull();
  });

  it('minimize button hides window (display: none)', () => {
    render(<Wrapper />);
    fireEvent.click(screen.getByTestId('open-btn'));
    fireEvent.click(screen.getByRole('button', { name: 'minimize' }));
    const winEl = screen.getByText('Test App').closest('[data-window-id]') as HTMLElement;
    expect(winEl.style.display).toBe('none');
  });

  it('maximize then restore button changes status', () => {
    render(<Wrapper />);
    fireEvent.click(screen.getByTestId('open-btn'));
    fireEvent.click(screen.getByRole('button', { name: 'maximize/restore' }));
    // After maximize: left/top/right = 0, bottom reserved for taskbar
    const winEl = screen.getByText('Test App').closest('[data-window-id]') as HTMLElement;
    expect(winEl.style.left === '0px' || winEl.style.left === '0').toBe(true);
    expect(winEl.style.top === '0px' || winEl.style.top === '0').toBe(true);
    expect(winEl.style.right === '0px' || winEl.style.right === '0').toBe(true);
  });

  it('useWindowManager throws outside provider', () => {
    function Bad() {
      useWindowManager();
      return null;
    }
    const err = console.error;
    console.error = () => {};
    expect(() => render(<Bad />)).toThrow();
    console.error = err;
  });
});

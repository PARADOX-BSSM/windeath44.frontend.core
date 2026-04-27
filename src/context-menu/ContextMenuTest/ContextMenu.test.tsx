import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ContextMenuProvider, useContextMenu } from '../ContextMenuProvider';
import type { MenuItem } from '../types';

const items: MenuItem[] = [
  { id: '1', type: 'action', label: 'Copy', onClick: vi.fn() },
  { id: '2', type: 'separator' },
  { id: '3', type: 'action', label: 'Delete', disabled: true, onClick: vi.fn() },
  { id: '4', type: 'submenu', label: 'Share', children: [] },
];

function Trigger() {
  const { show, hide } = useContextMenu();
  return (
    <>
      <button onClick={() => show({ x: 100, y: 100, items })}>open</button>
      <button onClick={hide}>close</button>
    </>
  );
}

function Wrapper() {
  return (
    <ContextMenuProvider>
      <Trigger />
    </ContextMenuProvider>
  );
}

describe('ContextMenu', () => {
  it('show() renders the menu', async () => {
    render(<Wrapper />);
    await act(async () => { fireEvent.click(screen.getByText('open')); });
    expect(screen.getByText('Copy')).toBeTruthy();
  });

  it('hide() removes the menu', async () => {
    render(<Wrapper />);
    await act(async () => { fireEvent.click(screen.getByText('open')); });
    await act(async () => { fireEvent.click(screen.getByText('close')); });
    expect(screen.queryByText('Copy')).toBeNull();
  });

  it('clicking outside hides the menu', async () => {
    render(<Wrapper />);
    await act(async () => { fireEvent.click(screen.getByText('open')); });
    await act(async () => {
      fireEvent.pointerDown(document.body);
    });
    expect(screen.queryByText('Copy')).toBeNull();
  });

  it('Escape key hides the menu', async () => {
    render(<Wrapper />);
    await act(async () => { fireEvent.click(screen.getByText('open')); });
    await act(async () => { fireEvent.keyDown(document, { key: 'Escape' }); });
    expect(screen.queryByText('Copy')).toBeNull();
  });

  it('renders separator', async () => {
    render(<Wrapper />);
    await act(async () => { fireEvent.click(screen.getByText('open')); });
    expect(screen.getByTestId('separator')).toBeTruthy();
  });

  it('disabled item click does not trigger onClick', async () => {
    const onClick = vi.fn();
    const disabledItems: MenuItem[] = [
      { id: '1', type: 'action', label: 'Disabled', disabled: true, onClick },
    ];
    function T() {
      const { show } = useContextMenu();
      return <button onClick={() => show({ x: 0, y: 0, items: disabledItems })}>open</button>;
    }
    render(<ContextMenuProvider><T /></ContextMenuProvider>);
    await act(async () => { fireEvent.click(screen.getByText('open')); });
    fireEvent.click(screen.getByRole('menuitem'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('submenu item renders label', async () => {
    render(<Wrapper />);
    await act(async () => { fireEvent.click(screen.getByText('open')); });
    expect(screen.getByTestId('submenu-item')).toBeTruthy();
  });

  it('useContextMenu throws outside provider', () => {
    function Bad() { useContextMenu(); return null; }
    const err = console.error;
    console.error = () => {};
    expect(() => render(<Bad />)).toThrow();
    console.error = err;
  });
});

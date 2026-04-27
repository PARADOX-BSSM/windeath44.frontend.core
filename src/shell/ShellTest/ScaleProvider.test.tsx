import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ScaleProvider, useScale } from '../ScaleProvider';

function ScaleDisplay() {
  const { scale, setScale, resetScale } = useScale();
  return (
    <div>
      <span data-testid="scale">{scale}</span>
      <button onClick={() => setScale(2)}>set-2x</button>
      <button onClick={() => resetScale()}>reset</button>
    </div>
  );
}

describe('ScaleProvider', () => {
  it('provides default scale from devicePixelRatio', () => {
    render(
      <ScaleProvider>
        <ScaleDisplay />
      </ScaleProvider>,
    );
    // jsdom defaults devicePixelRatio to 1
    expect(screen.getByTestId('scale').textContent).toBe('1');
  });

  it('setScale updates scale value', async () => {
    render(
      <ScaleProvider>
        <ScaleDisplay />
      </ScaleProvider>,
    );
    await act(async () => {
      fireEvent.click(screen.getByText('set-2x'));
    });
    expect(screen.getByTestId('scale').textContent).toBe('2');
  });

  it('resetScale restores devicePixelRatio value', async () => {
    render(
      <ScaleProvider>
        <ScaleDisplay />
      </ScaleProvider>,
    );
    await act(async () => {
      fireEvent.click(screen.getByText('set-2x'));
    });
    await act(async () => {
      fireEvent.click(screen.getByText('reset'));
    });
    expect(screen.getByTestId('scale').textContent).toBe('1');
  });

  it('useScale throws outside ScaleProvider', () => {
    function Bad() {
      useScale();
      return null;
    }
    const err = console.error;
    console.error = () => {};
    expect(() => render(<Bad />)).toThrow();
    console.error = err;
  });
});

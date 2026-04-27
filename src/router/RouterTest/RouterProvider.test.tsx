import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { RouterProvider, useRouter } from '../RouterProvider';

function LocationDisplay() {
  const { location, navigate, navigateDeepLink } = useRouter();
  return (
    <div>
      <span data-testid="loc">{location}</span>
      <button onClick={() => navigate('/about')}>go-about</button>
      <button onClick={() => navigate('/replaced', { replace: true })}>go-replace</button>
      <button onClick={() => navigateDeepLink('windeath44://terminal/logs')}>go-deeplink</button>
    </div>
  );
}

function Wrapper({ initialPath = '/' }: { initialPath?: string }) {
  return (
    <RouterProvider initialPath={initialPath}>
      <LocationDisplay />
    </RouterProvider>
  );
}

describe('RouterProvider', () => {
  it('shows initial location', () => {
    render(<Wrapper initialPath="/start" />);
    expect(screen.getByTestId('loc').textContent).toBe('/start');
  });

  it('navigate changes location', async () => {
    render(<Wrapper />);
    await act(async () => { fireEvent.click(screen.getByText('go-about')); });
    expect(screen.getByTestId('loc').textContent).toBe('/about');
  });

  it('navigate with replace updates location', async () => {
    render(<Wrapper />);
    await act(async () => { fireEvent.click(screen.getByText('go-replace')); });
    expect(screen.getByTestId('loc').textContent).toBe('/replaced');
  });

  it('navigateDeepLink extracts path', async () => {
    render(<Wrapper />);
    await act(async () => { fireEvent.click(screen.getByText('go-deeplink')); });
    expect(screen.getByTestId('loc').textContent).toBe('/logs');
  });

  it('matchRoute reflects current location', async () => {
    function MatchDisplay() {
      const { match, navigate } = useRouter();
      return (
        <>
          <span data-testid="match">{match?.route.processName ?? 'none'}</span>
          <button onClick={() => navigate('/app/5')}>go-app</button>
        </>
      );
    }
    render(
      <RouterProvider routes={[{ path: '/app/:id', processName: 'myapp' }]}>
        <MatchDisplay />
      </RouterProvider>,
    );
    await act(async () => { fireEvent.click(screen.getByText('go-app')); });
    expect(screen.getByTestId('match').textContent).toBe('myapp');
  });

  it('useRouter throws outside provider', () => {
    function Bad() { useRouter(); return null; }
    const err = console.error;
    console.error = () => {};
    expect(() => render(<Bad />)).toThrow();
    console.error = err;
  });
});

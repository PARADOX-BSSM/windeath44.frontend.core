import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { NotificationProvider, useNotifications } from '../NotificationProvider';

function NotifTester() {
  const { notifications, show, dismiss, dismissAll } = useNotifications();
  return (
    <div>
      <button onClick={() => show({ title: 'Hello', type: 'info', duration: 0 })}>show</button>
      <button onClick={() => notifications[0] && dismiss(notifications[0].id)}>dismiss-first</button>
      <button onClick={() => dismissAll()}>dismiss-all</button>
      <ul>
        {notifications.map((n) => (
          <li key={n.id} data-testid="notif">{n.title}</li>
        ))}
      </ul>
    </div>
  );
}

function Wrapper() {
  return (
    <NotificationProvider>
      <NotifTester />
    </NotificationProvider>
  );
}

describe('useNotifications', () => {
  it('show adds notification to the list', async () => {
    render(<Wrapper />);
    await act(async () => { fireEvent.click(screen.getByText('show')); });
    expect(screen.getAllByTestId('notif')).toHaveLength(1);
    expect(screen.getByText('Hello')).toBeTruthy();
  });

  it('dismiss removes notification', async () => {
    render(<Wrapper />);
    await act(async () => { fireEvent.click(screen.getByText('show')); });
    await act(async () => { fireEvent.click(screen.getByText('dismiss-first')); });
    expect(screen.queryAllByTestId('notif')).toHaveLength(0);
  });

  it('dismissAll clears all notifications', async () => {
    render(<Wrapper />);
    await act(async () => { fireEvent.click(screen.getByText('show')); });
    await act(async () => { fireEvent.click(screen.getByText('show')); });
    await act(async () => { fireEvent.click(screen.getByText('dismiss-all')); });
    expect(screen.queryAllByTestId('notif')).toHaveLength(0);
  });

  it('useNotifications throws outside provider', () => {
    function Bad() { useNotifications(); return null; }
    const err = console.error;
    console.error = () => {};
    expect(() => render(<Bad />)).toThrow();
    console.error = err;
  });
});

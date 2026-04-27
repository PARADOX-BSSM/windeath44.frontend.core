import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createNotificationStore } from '../NotificationStore';

const opts = { title: 'Test', type: 'info' as const };

describe('NotificationStore', () => {
  it('show adds notification to the front', () => {
    const store = createNotificationStore();
    const id = store.show(opts);
    expect(store.getState().notifications[0].id).toBe(id);
  });

  it('show returns unique ids', () => {
    const store = createNotificationStore();
    const id1 = store.show(opts);
    const id2 = store.show(opts);
    expect(id1).not.toBe(id2);
  });

  it('show prepends so latest is first', () => {
    const store = createNotificationStore();
    const id1 = store.show(opts);
    const id2 = store.show(opts);
    expect(store.getState().notifications[0].id).toBe(id2);
    expect(store.getState().notifications[1].id).toBe(id1);
  });

  it('dismiss removes notification', () => {
    const store = createNotificationStore();
    const id = store.show(opts);
    store.dismiss(id);
    expect(store.getState().notifications.find((n) => n.id === id)).toBeUndefined();
  });

  it('dismissAll clears all notifications', () => {
    const store = createNotificationStore();
    store.show(opts);
    store.show(opts);
    store.dismissAll();
    expect(store.getState().notifications).toHaveLength(0);
  });

  it('subscribe listener is called on show', () => {
    const store = createNotificationStore();
    let count = 0;
    store.subscribe(() => count++);
    store.show(opts);
    expect(count).toBe(1);
  });

  it('subscribe returns unsubscribe', () => {
    const store = createNotificationStore();
    let count = 0;
    const unsub = store.subscribe(() => count++);
    unsub();
    store.show(opts);
    expect(count).toBe(0);
  });

  describe('auto-dismiss', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('auto-dismisses after duration ms', () => {
      const store = createNotificationStore();
      store.show({ ...opts, duration: 1000 });
      expect(store.getState().notifications).toHaveLength(1);
      vi.advanceTimersByTime(1000);
      expect(store.getState().notifications).toHaveLength(0);
    });

    it('duration=0 does not auto-dismiss', () => {
      const store = createNotificationStore();
      store.show({ ...opts, duration: 0 });
      vi.advanceTimersByTime(60000);
      expect(store.getState().notifications).toHaveLength(1);
    });

    it('dismissAll clears pending timers', () => {
      const store = createNotificationStore();
      store.show({ ...opts, duration: 1000 });
      store.dismissAll();
      vi.advanceTimersByTime(2000);
      // no error, no phantom notifications
      expect(store.getState().notifications).toHaveLength(0);
    });
  });
});

import type { Notification, ShowNotificationOptions } from './types';

let _idCounter = 0;
function genId(): string {
  return `notif-${Date.now()}-${++_idCounter}`;
}

export interface NotificationStore {
  getState(): { notifications: Notification[] };
  show(options: ShowNotificationOptions): string;
  dismiss(id: string): void;
  dismissAll(): void;
  subscribe(listener: () => void): () => void;
}

export function createNotificationStore(): NotificationStore {
  let notifications: Notification[] = [];
  const listeners = new Set<() => void>();
  const timers = new Map<string, ReturnType<typeof setTimeout>>();

  function notify() {
    listeners.forEach((l) => l());
  }

  return {
    getState() {
      return { notifications };
    },

    show(options) {
      const id = genId();
      const notif: Notification = { ...options, id, createdAt: Date.now() };
      notifications = [notif, ...notifications];
      notify();

      const duration = options.duration ?? 4000;
      if (duration > 0) {
        const t = setTimeout(() => {
          this.dismiss(id);
        }, duration);
        timers.set(id, t);
      }

      return id;
    },

    dismiss(id) {
      const t = timers.get(id);
      if (t !== undefined) {
        clearTimeout(t);
        timers.delete(id);
      }
      notifications = notifications.filter((n) => n.id !== id);
      notify();
    },

    dismissAll() {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
      notifications = [];
      notify();
    },

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { createNotificationStore } from './NotificationStore';
import type { Notification, NotificationsContextValue, ShowNotificationOptions } from './types';

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error('useNotifications must be used inside <NotificationProvider>');
  return ctx;
}

export interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const store = useMemo(() => createNotificationStore(), []);
  const [notifications, setNotifications] = useState<Notification[]>(
    () => store.getState().notifications,
  );

  useEffect(() => store.subscribe(() => setNotifications([...store.getState().notifications])), [store]);

  const value: NotificationsContextValue = useMemo(
    () => ({
      notifications,
      show: (opts: ShowNotificationOptions) => store.show(opts),
      dismiss: (id: string) => store.dismiss(id),
      dismissAll: () => store.dismissAll(),
    }),
    [notifications, store],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

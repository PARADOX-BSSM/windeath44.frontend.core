export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'primary' | 'danger';
}

export interface Notification {
  id: string;
  title: string;
  body?: string;
  icon?: string;
  type: NotificationType;
  actions?: NotificationAction[];
  /** ms, 0 = 수동 dismiss만 */
  duration?: number;
  createdAt: number;
}

export type ShowNotificationOptions = Omit<Notification, 'id' | 'createdAt'>;

export interface NotificationsContextValue {
  notifications: Notification[];
  show(options: ShowNotificationOptions): string;
  dismiss(id: string): void;
  dismissAll(): void;
}

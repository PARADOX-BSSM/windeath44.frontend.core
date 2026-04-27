# windeath44.core/notifications

토스트 알림 큐 시스템. 자동 dismiss, 액션 버튼, 알림 타입 지원.

## Import

```typescript
import { NotificationProvider, useNotifications } from 'windeath44.core/notifications';
```

## 기본 사용법

```tsx
import { NotificationProvider, useNotifications } from 'windeath44.core/notifications';

function App() {
  return (
    <NotificationProvider>
      <MyApp />
    </NotificationProvider>
  );
}

function MyComponent() {
  const { show } = useNotifications();

  return (
    <button onClick={() =>
      show({
        title: '저장 완료',
        body: '파일이 저장되었습니다.',
        type: 'success',
        duration: 3000,
      })
    }>
      저장
    </button>
  );
}
```

## useNotifications API

```typescript
const {
  notifications,  // Notification[] — 현재 알림 목록 (최신순)
  show(options),  // 알림 표시, id 반환
  dismiss(id),    // 특정 알림 닫기
  dismissAll(),   // 모든 알림 닫기
} = useNotifications();
```

## ShowNotificationOptions

```typescript
interface ShowNotificationOptions {
  title: string;
  body?: string;
  icon?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  actions?: NotificationAction[];
  duration?: number;  // ms, 기본 4000. 0이면 수동 dismiss만
}
```

## 액션 버튼

```typescript
show({
  title: '삭제하시겠습니까?',
  type: 'warning',
  duration: 0,
  actions: [
    { label: '삭제', variant: 'danger', onClick: () => deleteFile() },
    { label: '취소', onClick: () => {} },
  ],
});
```

## Tests

```
src/notifications/NotificationsTest/
├── NotificationStore.test.ts  — 10 tests (show/dismiss/dismissAll/auto-dismiss/timers)
└── useNotifications.test.tsx  — 4 tests (React context 통합)
```
